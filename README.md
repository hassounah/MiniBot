# Chatbot Application

This project is a simple chatbot application that allows users to interact with an AI-powered chatbot. It includes both frontend and backend components.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Docker installed on your local machine
- minikube installed and running on your local machine [minikube start](https://minikube.sigs.k8s.io/docs/start/)
- enable minikube ingress [minikube ingress](https://kubernetes.io/docs/tasks/access-application-cluster/ingress-minikube/) 
- OpenAI API key (sign up at [OpenAI](https://beta.openai.com/signup/))

## Build and Deployment

To build and deploy the project, follow these steps:

1. Clone this repository to your local machine:
    ```
    git clone git@github.com:hassounah/MiniBot.git
    cd MiniBot
    ```
2. Create docker images
    ```
    bash create_docker_images.sh
    ```
3. Set up Kubernetes secrets with your OpenAI API key and PostgreSQL password:
    ```
    kubectl create secret generic backend-secrets \
    --from-literal=OPENAI_API_KEY=<your-openai-api-key> \
    --from-literal=POSTGRES_PASSWORD=<your-postgresql-password>
    ```
4. Apply Kubernetes configurations:
    ```
    kubectl apply -f kube/
    ```
5. Get your minikube IP
    ```
    minikube ip
    ```
6. Access the chatbot by opening a browser window and navigate to your minikube IP


## Additional Information

- This project uses React.js for the frontend, Flask for the backend, and PostgreSQL for the database.
- The chatbot functionality is powered by OpenAI's GPT-3.5-Turbo model by default.
- Kubernetes is used for orchestration, and Docker is used for containerization.

### Application Flow

#### Frontend Service:

- The frontend service in MiniBot represents the user interface, allowing users to interact with the chatbot.
- It serves static assets such as HTML, CSS, and JavaScript files to the client browser.
- Components like ChatApp, Config, and History pages are part of the frontend service.
- This frontend service is deployed with kubernetes as an NGINX containerized web server application, serving the static assets.
- It is managed using a Kubernetes Deployment and Service

#### Backend Service:

- The backend service handles the core functionalities of the chatbot, including processing user requests, generating responses, and managing configurations and history.
- It exposes RESTful API endpoints for communication with the frontend and other components.
- In MiniBot, the backend service is implemented using Python Flask.
- The backend service is deployed as a containerized Flask application, managed by a Kubernetes Deployment.
- It interacts with a PostgreSQL database to persist chat history and configurations. The PostgreSQL database is deployed in the same Kubernetes Deployment
- The backend service also integrates with external APIs, such as the OpenAI API in MiniBot, for generating responses using AI models.


#### External API Integration:

- MiniBot integrates with external APIs, such as the OpenAI API, to enhance chatbot responses with AI capabilities.
- The integration with external APIs is abstracted within the backend service, which makes HTTP requests to the API endpoints to retrieve data or perform actions.
- Authentication credentials for accessing external APIs are securely stored as environment variables within the Kubernetes environment or using Kubernetes secrets for enhanced security.

#### Communication Channels:

- MiniBot communication channels are managed by an ingress controller to separate traffic for backend and frontend services
