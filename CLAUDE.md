# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Connelaide UI is an Angular 17 frontend application with Auth0 authentication, deployed to AWS ECS via CloudFormation.

## Development Commands

```bash
# Start dev server with API proxy (proxies /api to localhost:8000)
npm start

# Build for production
npm run build

# Generate a new component (inline template/styles, no tests per angular.json)
ng generate component component-name
```

## Deployment Commands

```bash
make setup      # Create ECR repository (one-time)
make build      # Build Docker image
make push       # Build + push to ECR
make deploy CERTIFICATE_ARN=arn:aws:acm:...  # Deploy CloudFormation stack
make update     # Build, push, and redeploy ECS service
make get-ip     # Get running task's public IP
make cleanup    # Delete CloudFormation stack
```

## Architecture

**Standalone Angular components** - No NgModules. Components use `standalone: true` and import dependencies directly.

**Auth0 integration** - Configured in `app.config.ts` with automatic token injection for `/api/v1/protected*` and `/api/v1/user/*` routes via `authHttpInterceptorFn`.

**API proxy** - Dev server proxies `/api` requests to `localhost:8000` (see `proxy.conf.json`). Expects a backend API running locally.

**AWS deployment** - Multi-stage Dockerfile (Node build -> nginx serve). CloudFormation creates ECS Fargate cluster with ALB.

## Key Files

- `src/app/app.config.ts` - App configuration including Auth0 provider setup
- `src/app/auth.service.ts` - HTTP service for API calls (public and protected endpoints)
- `src/app/app.component.ts` - Root component with auth UI and API testing
- `proxy.conf.json` - Dev server proxy configuration
- `cloudformation.yml` - AWS infrastructure definition
