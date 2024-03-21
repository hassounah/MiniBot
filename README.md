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
- The chatbot functionality is powered by OpenAI's GPT-3.5-Turbo model.
- Kubernetes is used for orchestration, and Docker is used for containerization.
