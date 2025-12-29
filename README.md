# Connelaide UI

A minimal Angular application deployed on AWS ECS.

## Local Development

Run `npm start` or `ng serve` for a dev server. Navigate to `http://localhost:4200/`.

## AWS Deployment

### Prerequisites
- AWS CLI configured with appropriate credentials
- Docker installed
- Make installed

### Quick Start with Makefile

The Makefile simplifies all deployment commands:

```bash
# One-time setup: create ECR repository
make setup

# Build, push, and deploy
make build
make push
make deploy

# Get your app's public IP
make get-ip

# Update deployment with new changes
make update

# Clean up all resources
make cleanup
```

### Available Make Targets

- `make help` - Show all available commands
- `make setup` - Create ECR repository (one-time)
- `make build` - Build Docker image locally
- `make push` - Push image to ECR (includes build)
- `make deploy` - Deploy CloudFormation stack
- `make update` - Build, push, and redeploy service
- `make get-ip` - Get the public IP address
- `make cleanup` - Delete all AWS resources

### Manual Deployment (without Make)

<details>
<summary>Click to expand manual deployment steps</summary>

1. **Create an ECR Repository** (one-time setup):
```bash
aws ecr create-repository --repository-name connelaide-ui --region us-east-1
```

2. **Build and Push Docker Image**:
```bash
# Get ECR login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build the image
docker build -t connelaide-ui .

# Tag the image
docker tag connelaide-ui:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/connelaide-ui:latest

# Push to ECR
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/connelaide-ui:latest
```

3. **Deploy with CloudFormation**:
```bash
aws cloudformation create-stack \
  --stack-name connelaide-ui-stack \
  --template-body file://cloudformation.yml \
  --parameter ParameterKey=ImageUri,ParameterValue=YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/connelaide-ui:latest \
  --capabilities CAPABILITY_IAM \
  --region us-east-1
```

</details>

## Angular CLI Commands

- `ng generate component component-name` - Generate a new component
- `ng build` - Build the project
- `ng help` - Get help on Angular CLI
