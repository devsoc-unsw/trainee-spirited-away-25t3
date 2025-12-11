# AWS Deployment Guide

This guide explains how to deploy the Online Compiler application to AWS and why certain services are recommended.

## Overview

For an online compiler application, you need to handle:
1. **Code Execution** - Running user-submitted code securely
2. **Scalability** - Handling multiple concurrent users
3. **Security** - Sandboxing code execution to prevent malicious code
4. **API Layer** - Serving REST APIs
5. **Frontend** - Serving the React application

## Why AWS for an Online Compiler?

### 1. **Secure Code Execution**
Running user-submitted code is a security risk. AWS provides several options:
- **Docker Containers** - Isolate each execution in a container
- **AWS Lambda** - Serverless execution with built-in isolation
- **ECS/Fargate** - Container orchestration for more control

### 2. **Scalability**
- **Auto-scaling** - Handle traffic spikes automatically
- **Load Balancing** - Distribute requests across multiple instances
- **Serverless** - Pay only for what you use

### 3. **Managed Services**
- **RDS/DynamoDB** - For session storage
- **ElastiCache (Redis)** - For session caching
- **S3** - For static frontend hosting
- **CloudFront** - CDN for faster global access

## Recommended Architecture

### Option 1: Serverless (Recommended for MVP)

```
┌─────────────┐
│   CloudFront│  (CDN for frontend)
└──────┬──────┘
       │
       ├─── S3 (Frontend static files)
       │
       └─── API Gateway
              │
              ├─── Lambda Functions
              │    ├─── Compiler Handler
              │    ├─── AI Handler
              │    └─── Session Handler
              │
              └─── ECS/Fargate (Code Execution)
                   └─── Docker Containers (Sandboxed)
```

**Pros:**
- Low cost for low traffic
- Auto-scaling
- No server management
- Built-in security

**Cons:**
- Cold starts (Lambda)
- Less control over execution environment

### Option 2: Container-Based (Recommended for Production)

```
┌─────────────┐
│   CloudFront│  (CDN)
└──────┬──────┘
       │
       ├─── S3 (Frontend)
       │
       └─── Application Load Balancer
              │
              ├─── ECS/Fargate (API Server)
              │    └─── Express.js containers
              │
              └─── ECS/Fargate (Code Execution)
                   └─── Docker containers (one per execution)
```

**Pros:**
- More control
- Better for long-running processes
- Easier debugging
- Consistent performance

**Cons:**
- Higher cost
- More setup required

## Step-by-Step Deployment

### 1. Frontend Deployment (S3 + CloudFront)

#### Create S3 Bucket
```bash
aws s3 mb s3://your-compiler-frontend
```

#### Build and Upload Frontend
```bash
cd client
npm run build
aws s3 sync dist/ s3://your-compiler-frontend --delete
```

#### Enable Static Website Hosting
```bash
aws s3 website s3://your-compiler-frontend \
  --index-document index.html \
  --error-document index.html
```

#### Create CloudFront Distribution
- Origin: Your S3 bucket
- Default root object: `index.html`
- Error pages: Redirect 404 to `index.html` (for React Router)

### 2. Backend Deployment

#### Option A: AWS Lambda (Serverless)

**Create Lambda Function**
```bash
# Package your server code
cd server
zip -r function.zip . -x "node_modules/*" "*.git*"

# Create Lambda function
aws lambda create-function \
  --function-name compiler-api \
  --runtime nodejs20.x \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \
  --handler server.handler \
  --zip-file fileb://function.zip
```

**Create API Gateway**
- Create REST API
- Create resources and methods
- Connect to Lambda functions
- Deploy to a stage

#### Option B: ECS/Fargate (Containers)

**Create Dockerfile**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

**Build and Push to ECR**
```bash
# Create ECR repository
aws ecr create-repository --repository-name compiler-api

# Build and push
docker build -t compiler-api .
aws ecr get-login-password | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com
docker tag compiler-api:latest YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/compiler-api:latest
docker push YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/compiler-api:latest
```

**Create ECS Task Definition**
```json
{
  "family": "compiler-api",
  "networkMode": "awsvpc",
  "containerDefinitions": [
    {
      "name": "compiler-api",
      "image": "YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/compiler-api:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "5000"
        }
      ],
      "secrets": [
        {
          "name": "AI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:ai-api-key"
        }
      ]
    }
  ]
}
```

**Create ECS Service**
- Use Fargate launch type
- Configure auto-scaling
- Set up load balancer

### 3. Code Execution Sandboxing

**Docker Container Approach (Recommended)**

Create a separate service for code execution:

```dockerfile
# Dockerfile for code execution
FROM python:3.11-slim

# Install language runtimes
RUN apt-get update && apt-get install -y \
    nodejs \
    openjdk-17-jdk \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set up restricted user
RUN useradd -m -u 1000 runner && \
    chown -R runner:runner /home/runner

USER runner
WORKDIR /home/runner

# Copy execution script
COPY --chown=runner:runner execute.sh .
RUN chmod +x execute.sh

CMD ["./execute.sh"]
```

**ECS Task for Execution**
- Use Fargate with minimal resources
- Set CPU/memory limits
- Configure task timeout
- One task per execution (ephemeral)

### 4. Database/Session Storage

#### Option A: DynamoDB (NoSQL)
```bash
aws dynamodb create-table \
  --table-name compiler-sessions \
  --attribute-definitions \
    AttributeName=sessionId,AttributeType=S \
  --key-schema \
    AttributeName=sessionId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

#### Option B: ElastiCache (Redis)
- Create Redis cluster
- Update session service to use Redis client
- Configure TTL for sessions

### 5. Environment Variables & Secrets

**Use AWS Secrets Manager**
```bash
aws secretsmanager create-secret \
  --name ai-api-key \
  --secret-string "your-api-key-here"
```

**Update your code to fetch from Secrets Manager:**
```javascript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'us-east-1' });
const command = new GetSecretValueCommand({ SecretId: 'ai-api-key' });
const response = await client.send(command);
const apiKey = response.SecretString;
```

### 6. Security Considerations

1. **Network Security**
   - Use VPC for ECS tasks
   - Security groups with minimal access
   - No public IPs for execution containers

2. **Code Execution Security**
   - Run in Docker containers with resource limits
   - Use read-only filesystem where possible
   - Network isolation (no internet access for execution)
   - Time limits on execution
   - Memory limits

3. **API Security**
   - Enable CORS properly
   - Use API Gateway for rate limiting
   - Implement authentication (Cognito)
   - Use HTTPS everywhere

4. **Secrets Management**
   - Never commit secrets
   - Use AWS Secrets Manager
   - Rotate keys regularly

## Cost Estimation (Approximate)

### Serverless (Low Traffic)
- Lambda: ~$0.20 per 1M requests
- API Gateway: ~$3.50 per 1M requests
- S3: ~$0.023 per GB storage
- CloudFront: ~$0.085 per GB transfer
- **Total**: ~$10-50/month for low traffic

### Container-Based (Medium Traffic)
- ECS Fargate: ~$0.04 per vCPU-hour, ~$0.004 per GB-hour
- Application Load Balancer: ~$0.0225 per hour
- S3: ~$0.023 per GB storage
- CloudFront: ~$0.085 per GB transfer
- **Total**: ~$50-200/month for medium traffic

## Monitoring & Logging

1. **CloudWatch**
   - Logs from Lambda/ECS
   - Metrics for API calls
   - Alarms for errors

2. **X-Ray**
   - Distributed tracing
   - Performance monitoring

3. **CloudWatch Dashboards**
   - Real-time metrics
   - Error rates
   - Execution times

## CI/CD Pipeline

Use AWS CodePipeline or GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and push Docker image
        run: |
          docker build -t compiler-api .
          # Push to ECR
      - name: Update ECS service
        run: |
          aws ecs update-service --cluster compiler-cluster --service compiler-api --force-new-deployment
```

## Next Steps

1. Set up AWS account and configure CLI
2. Choose deployment option (Serverless vs Container)
3. Set up infrastructure using Terraform or CloudFormation
4. Configure CI/CD pipeline
5. Test deployment
6. Set up monitoring and alerts
7. Configure custom domain (Route 53)

## Additional Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Amazon ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)

