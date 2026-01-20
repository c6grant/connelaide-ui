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

**Feature-based folder structure** - Organized into core, shared, and features modules:
- `core/` - Singleton services (auth.service.ts) and guards (auth.guard.ts)
- `shared/` - Reusable components (header, loading-spinner), models, and pipes
- `features/` - Lazy-loaded feature modules (dashboard, transactions)

**Auth0 integration** - Configured in `app.config.ts` with automatic token injection for `/api/v1/protected*`, `/api/v1/user/*`, and `/api/v1/transactions/*` routes via `authHttpInterceptorFn`.

**Lazy loading** - Dashboard and transactions features are lazy-loaded via `app.routes.ts` for optimal bundle size.

**API proxy** - Dev server proxies `/api` requests to `localhost:8000` (see `proxy.conf.json`). Expects a backend API running locally.

**AWS deployment** - Multi-stage Dockerfile (Node build -> nginx serve). CloudFormation creates ECS Fargate cluster with ALB.

## Folder Structure

```
src/app/
  core/                          # Singleton services, guards
    guards/auth.guard.ts         # Route protection using Auth0
    services/auth.service.ts     # General API service
  shared/                        # Reusable across features
    components/layout/header/    # Navigation header
    components/ui/loading-spinner/
    models/                      # Transaction, User interfaces
    pipes/                       # currency-format, date-range
  features/
    dashboard/                   # Dashboard page with stats and charts
    transactions/                # Transactions list with 2-week chunks
  app.component.ts               # Shell (header + router-outlet)
  app.config.ts                  # Providers including router
  app.routes.ts                  # Main route config with lazy loading
```

## Key Files

- `src/app/app.config.ts` - App configuration including router and Auth0 provider setup
- `src/app/app.routes.ts` - Main routing with lazy-loaded feature modules
- `src/app/core/guards/auth.guard.ts` - Functional guard for protected routes
- `src/app/core/services/auth.service.ts` - HTTP service for API calls
- `src/app/features/dashboard/` - Dashboard feature module
- `src/app/features/transactions/` - Transactions feature module with inline editing
- `proxy.conf.json` - Dev server proxy configuration
- `cloudformation.yml` - AWS infrastructure definition
