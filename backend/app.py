import time
from flask import Flask, jsonify, request
from flask_cors import CORS
import openai
import os
import psycopg2

# initialize flask app
app = Flask(__name__)
CORS(app)

openai.api_key = os.getenv('OPENAI_API_KEY')


def connect_to_database():
    attempts = 0
    max_attempts = 12
    delay_seconds = 10

    while attempts < max_attempts:
        try:
            conn = psycopg2.connect(
                host="localhost",
                database=os.getenv('POSTGRES_DB'),
                user=os.getenv('POSTGRES_USER'),
                password=os.getenv('POSTGRES_PASSWORD')
            )
            print("Database connection established successfully.")
            return conn
        except psycopg2.OperationalError as e:
            attempts += 1
            print(f"Error connecting to the database (attempt {attempts}/{max_attempts}): {e}")
            time.sleep(delay_seconds)

    raise Exception(f"Failed to connect to the database after {max_attempts} attempts.")


# Connect to PostgreSQL database
conn = connect_to_database()
cur = conn.cursor()


def initialize_database():
    try:
        cur.execute("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_history');")
        table_exists = cur.fetchone()[0]
        if not table_exists:
            cur.execute("""
                CREATE TABLE chat_history (
                    id SERIAL PRIMARY KEY,
                    request_text TEXT NOT NULL,
                    response_text TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            conn.commit()
            print("Database initialization successful.")

        # Create table for models if it doesn't exist
        cur.execute("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'models');")
        table_exists = cur.fetchone()[0]
        if not table_exists:
            cur.execute("""
                CREATE TABLE models (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    active BOOLEAN DEFAULT FALSE
                );
            """)
            conn.commit()
            print("Models table created successfully.")

        # Check if any models exist in the table
        cur.execute("SELECT EXISTS (SELECT 1 FROM models);")
        models_exist = cur.fetchone()[0]
        if not models_exist:
            # Insert default model into the table
            cur.execute("""
                INSERT INTO models (name, description, active) VALUES (%s, %s, %s)
            """, ('gpt-3.5-turbo', 'Default model', True))
            conn.commit()
            print("Default model added to the models table.")

    except psycopg2.Error as e:
        print("Database error:", e)
    except Exception as e:
        print("An unexpected error occurred:", e)


initialize_database()


def get_completion(prompt, active_model):
    messages = [{"role": "user", "content": prompt}]
    response = openai.chat.completions.create(
        model=active_model,
        messages=messages,
        temperature=0,
    )
    return response.choices[0].message.content


@app.route('/api/messages', methods=['POST'])
def generate_message():
    data = request.get_json()
    prompt = data.get('prompt', '')

    # Fetch active model from the database
    cur.execute("SELECT name FROM models WHERE active = TRUE;")
    active_model = cur.fetchone()[0]
    print(f"active_model: {active_model}")
    response = get_completion(prompt=prompt, active_model=active_model)

    cur.execute("INSERT INTO chat_history (request_text, response_text) VALUES (%s, %s)", (prompt, response))
    conn.commit()

    return jsonify({'text': response})


@app.route('/api/history', methods=['GET'])
def get_history():
    cur.execute("SELECT * FROM chat_history ORDER BY timestamp DESC")
    history = [{'id': row[0], 'request_text': row[1], 'response_text': row[2], 'timestamp': row[3]} for row in cur.fetchall()]
    return jsonify(history)


@app.route('/api/history/<int:message_id>', methods=['DELETE'])
def delete_message(message_id):
    cur.execute("DELETE FROM chat_history WHERE id = %s", (message_id,))
    conn.commit()
    return jsonify({'message': 'Message deleted successfully'})


@app.route('/api/models', methods=['GET'])
def get_models():
    cur.execute("SELECT * FROM models;")
    models = [{'id': row[0], 'name': row[1], 'description': row[2], 'active': row[3]} for row in cur.fetchall()]
    return jsonify(models)


@app.route('/api/models', methods=['POST'])
def create_model():
    data = request.get_json()
    name = data.get('name', '')
    description = data.get('description', '')

    cur.execute("INSERT INTO models (name, description) VALUES (%s, %s)", (name, description))
    conn.commit()

    return jsonify({'message': 'Model created successfully'})


@app.route('/api/models/<int:model_id>', methods=['PUT'])
def update_model(model_id):
    data = request.get_json()
    name = data.get('name', '')
    description = data.get('description', '')

    cur.execute("UPDATE models SET name = %s, description = %s WHERE id = %s", (name, description, model_id))
    conn.commit()

    return jsonify({'message': 'Model updated successfully'})


@app.route('/api/models/<int:model_id>', methods=['DELETE'])
def delete_model(model_id):
    cur.execute("DELETE FROM models WHERE id = %s", (model_id,))
    conn.commit()
    return jsonify({'message': 'Model deleted successfully'})


@app.route('/api/models/<int:model_id>/set_active', methods=['PUT'])
def set_active_model(model_id):
    # Set active field to False for all models
    cur.execute("UPDATE models SET active = FALSE;")
    # Set active field to True for the specified model
    cur.execute("UPDATE models SET active = TRUE WHERE id = %s", (model_id,))
    conn.commit()
    return jsonify({'message': 'Active model set successfully'})


@app.route('/api/models/active', methods=['GET'])
def get_active_model():
    cur.execute("SELECT id FROM models WHERE active = TRUE;")
    active_model_id = cur.fetchone()[0]
    return jsonify({'id': active_model_id})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
