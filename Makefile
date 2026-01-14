.PHONY: help build push deploy update update-stack cleanup get-ip

# Variables - Set these for your environment
AWS_REGION ?= us-east-2
AWS_ACCOUNT_ID ?= $(shell aws sts get-caller-identity --query Account --output text)
REPOSITORY_NAME = connelaide-ui
IMAGE_TAG ?= latest
STACK_NAME = connelaide-ui-stack
CLUSTER_NAME = connelaide-cluster
SERVICE_NAME = connelaide-service
CERTIFICATE_ARN ?= 

ECR_URI = $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(REPOSITORY_NAME)
IMAGE_URI = $(ECR_URI):$(IMAGE_TAG)

help:
	@echo "Available targets:"
	@echo "  setup       - Create ECR repository (one-time setup)"
	@echo "  build       - Build Docker image"
	@echo "  push        - Push Docker image to ECR"
	@echo "  deploy      - Deploy stack with CloudFormation (requires CERTIFICATE_ARN)"
	@echo "  update      - Build, push, and force new ECS deployment"
	@echo "  update-stack - Update CloudFormation stack (for certificate/config changes)"
	@echo "  get-ip      - Get the public IP of the running task"
	@echo "  cleanup     - Delete CloudFormation stack"
	@echo ""
	@echo "Full workflow: make setup build push deploy CERTIFICATE_ARN=arn:aws:acm:..."

setup:
	@echo "Creating ECR repository..."
	aws ecr create-repository \
		--repository-name $(REPOSITORY_NAME) \
		--region $(AWS_REGION) || echo "Repository may already exist"

build:
	@echo "Building Docker image for linux/amd64..."
	docker build --platform linux/amd64 -t $(REPOSITORY_NAME):$(IMAGE_TAG) .

push: build
	@echo "Logging into ECR..."
	aws ecr get-login-password --region $(AWS_REGION) | \
		docker login --username AWS --password-stdin $(ECR_URI)
	@echo "Tagging image..."
	docker tag $(REPOSITORY_NAME):$(IMAGE_TAG) $(IMAGE_URI)
	@echo "Pushing to ECR..."
	docker push $(IMAGE_URI)

deploy:
	@echo "Fetching default VPC information..."
	@VPC_ID=$$(aws ec2 describe-vpcs \
		--filters "Name=is-default,Values=true" \
		--query "Vpcs[0].VpcId" \
		--output text \
		--region $(AWS_REGION)); \
	SUBNET_IDS=$$(aws ec2 describe-subnets \
		--filters "Name=vpc-id,Values=$$VPC_ID" \
		--query "Subnets[0:2].SubnetId" \
		--output text \
		--region $(AWS_REGION) | tr '\t' ','); \
	echo "Using VPC: $$VPC_ID"; \
	echo "Using Subnets: $$SUBNET_IDS"; \
	if [ -z "$(CERTIFICATE_ARN)" ]; then \
		echo "ERROR: CERTIFICATE_ARN is required. Set it with: make deploy CERTIFICATE_ARN=arn:aws:acm:..."; \
		exit 1; \
	fi; \
	echo "Deploying CloudFormation stack..."; \
	aws cloudformation create-stack \
		--stack-name $(STACK_NAME) \
		--template-body file://cloudformation.yml \
		--parameters \
			ParameterKey=ImageUri,ParameterValue=$(IMAGE_URI) \
			ParameterKey=VpcId,ParameterValue=$$VPC_ID \
			ParameterKey=SubnetIds,ParameterValue=\"$$SUBNET_IDS\" \
			ParameterKey=CertificateArn,ParameterValue=$(CERTIFICATE_ARN) \
		--capabilities CAPABILITY_IAM \
		--region $(AWS_REGION); \
	echo "Waiting for stack creation..."; \
	aws cloudformation wait stack-create-complete \
		--stack-name $(STACK_NAME) \
		--region $(AWS_REGION); \
	echo "Stack deployed successfully!"

update: push
	@echo "Forcing new ECS deployment..."
	aws ecs update-service \
		--cluster $(CLUSTER_NAME) \
		--service $(SERVICE_NAME) \
		--force-new-deployment \
		--region $(AWS_REGION)
	@echo "Update initiated. Service will redeploy with new image."
update-stack:
	@echo "Updating CloudFormation stack..."
	aws cloudformation update-stack \
		--stack-name $(STACK_NAME) \
		--template-body file://cloudformation.yml \
		--parameters \
			ParameterKey=ImageUri,UsePreviousValue=true \
			ParameterKey=VpcId,UsePreviousValue=true \
			ParameterKey=SubnetIds,UsePreviousValue=true \
			ParameterKey=CertificateArn,UsePreviousValue=true \
		--capabilities CAPABILITY_IAM \
		--region $(AWS_REGION); \
	echo "Waiting for stack update..."; \
	aws cloudformation wait stack-update-complete \
		--stack-name $(STACK_NAME) \
		--region $(AWS_REGION); \
	echo "Stack updated successfully!"


get-ip:
	@echo "Fetching task information..."
	@TASK_ARN=$$(aws ecs list-tasks \
		--cluster $(CLUSTER_NAME) \
		--region $(AWS_REGION) \
		--query 'taskArns[0]' \
		--output text); \
	if [ "$$TASK_ARN" != "None" ] && [ -n "$$TASK_ARN" ]; then \
		ENI_ID=$$(aws ecs describe-tasks \
			--cluster $(CLUSTER_NAME) \
			--tasks $$TASK_ARN \
			--region $(AWS_REGION) \
			--query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
			--output text); \
		PUBLIC_IP=$$(aws ec2 describe-network-interfaces \
			--network-interface-ids $$ENI_ID \
			--region $(AWS_REGION) \
			--query 'NetworkInterfaces[0].Association.PublicIp' \
			--output text); \
		echo "Public IP: $$PUBLIC_IP"; \
		echo "Access your app at: http://$$PUBLIC_IP"; \
	else \
		echo "No running tasks found"; \
	fi

cleanup:
	@echo "Deleting CloudFormation stack..."
	aws cloudformation delete-stack \
		--stack-name $(STACK_NAME) \
		--region $(AWS_REGION)
	@echo "Stack deletion initiated. This may take a few minutes."
