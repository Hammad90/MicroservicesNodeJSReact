# MicroservicesNodeJSReact
This repository is for the Udemy course Microservices with NodeJS and React

Dependencies:
- Docker
- Kubernetes
- Skaffold

Pre-Requisites:

Run this command to define JWT_KEY

kubectl create secret generic jwt-secret --from-literal=JWT_KEY=asdf

Run Nginx using this command

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.43.0/deploy/static/provider/cloud/deploy.yaml
