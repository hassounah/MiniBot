

pushd backend || (echo "backend dir not found" && exit 2)
docker build -t chatbot-backend:0.0.1 .
popd
pushd frontend || (echo "frontend dir not found" && exit 2)
docker build -t chatbot-frontend:0.0.1 .
popd



