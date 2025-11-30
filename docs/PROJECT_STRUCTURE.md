# TETRIX Project Structure

This document describes the organization and structure of the TETRIX project.

## 📁 Root Directory Structure

```
tetrix/
├── src/                    # Source code (Astro frontend)
├── public/                 # Static assets
├── backend/                # Backend API service
├── services/               # Microservices
├── apps/                   # Application modules
├── packages/               # Shared packages
├── scripts/                # Utility and deployment scripts
├── docs/                   # Project documentation
├── tests/                  # Test files
├── config/                 # Configuration files
│   ├── env-templates/      # Environment variable templates
│   └── test/              # Test configuration files
├── docker/                 # Docker-related files
│   ├── Dockerfile
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── Dockerfile.tetrix
├── nginx/                  # Nginx configuration
├── legacy/                 # Legacy code (deprecated)
├── campaign/               # Campaign management
├── rpa/                    # RPA (Robotic Process Automation)
├── data/                   # Data files
├── backups/                # Backup files
├── temp/                   # Temporary files (gitignored)
├── test-artifacts/        # Test artifacts (gitignored)
├── venv/                   # Python virtual environment (gitignored)
│
├── package.json            # Main package.json
├── pnpm-lock.yaml          # pnpm lockfile
├── pnpm-workspace.yaml     # pnpm workspace config
├── docker-compose.yml      # Docker Compose configuration
├── docker.env              # Docker environment variables (gitignored)
│
├── astro.config.mjs         # Astro configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration (root)
├── tsconfig-build.json     # TypeScript build config
├── tsconfig-check.json     # TypeScript check config
├── tsconfig.test.json      # TypeScript test config
│
├── firestore.rules         # Firestore security rules
├── Procfile                # Process file for deployment
├── README.md               # Project README
└── .gitignore              # Git ignore rules
```

## 📂 Directory Details

### `/src/` - Frontend Source Code
- Astro components, pages, and layouts
- Main application frontend code
- API routes (Astro API endpoints)

### `/backend/` - Backend Service
- Express.js backend API
- Authentication and authorization
- Database integration
- Business logic

### `/services/` - Microservices
- Individual service modules
- Service-specific implementations

### `/apps/` - Application Modules
- Separate application modules
- Feature-specific applications

### `/packages/` - Shared Packages
- Shared code across services
- Common utilities and libraries

### `/scripts/` - Scripts
- Deployment scripts
- Utility scripts
- Build scripts
- Diagnostic scripts

### `/docs/` - Documentation
Organized by category:
- `/api/` - API documentation
- `/database/` - Database documentation
- `/testing/` - Testing documentation
- `/deployment/` - Deployment guides
- `/analysis/` - System analysis

### `/config/` - Configuration Files
- `/env-templates/` - Environment variable templates
  - `docker.env.example`
  - `env.2fa.template`
  - `env.digitalocean.template`
- `/monitoring/` - Monitoring configuration

### `/docker/` - Docker Files
- `Dockerfile` - Main Dockerfile
- `Dockerfile.frontend` - Frontend container
- `Dockerfile.backend` - Backend container
- `Dockerfile.tetrix` - TETRIX-specific container

### `/nginx/` - Nginx Configuration
- Nginx configuration files
- Reverse proxy setup
- SSL configuration

### `/tests/` - Test Files
- Unit tests
- Integration tests
- E2E tests

### `/rpa/` - RPA Platform
- RPA automation code
- Workflow definitions
- Integration services

### `/campaign/` - Campaign Management
- Lead generation
- Campaign scripts
- MCP integrations

## 🔧 Configuration Files

### Root Level Config Files
These files must remain in the root for tooling to find them:
- `package.json` - Node.js package configuration
- `pnpm-workspace.yaml` - pnpm workspace configuration
- `astro.config.mjs` - Astro framework configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration (main)
- `tsconfig-*.json` - TypeScript configuration variants
- `docker-compose.yml` - Docker Compose configuration
- `.gitignore` - Git ignore rules

### Moved to `/config/`
- Environment templates → `/config/env-templates/`
- Monitoring configuration → `/config/monitoring/`

### Kept in Root (Tool Requirements)
- `playwright.config.*` - Playwright expects config in root
- `vitest.config.*` - Vitest expects config in root
- `postcss.config.*` - PostCSS expects config in root

### Moved to `/docker/`
- All Dockerfile variants → `/docker/`

## 📝 File Organization Principles

1. **Source Code**: All source code in `/src/`, `/backend/`, `/services/`
2. **Configuration**: Organized in `/config/` subdirectories
3. **Docker Files**: All Docker-related files in `/docker/`
4. **Documentation**: All docs in `/docs/` with subdirectories
5. **Scripts**: All utility scripts in `/scripts/`
6. **Tests**: All test files in `/tests/`
7. **Temporary Files**: In `/temp/`, `/test-artifacts/`, `/venv/` (gitignored)

## 🚫 Gitignored Directories

These directories are excluded from version control:
- `node_modules/` - Node.js dependencies
- `dist/` - Build output
- `temp/` - Temporary files
- `test-artifacts/` - Test artifacts
- `venv/` - Python virtual environment
- `.env` - Environment variables (sensitive)
- `docker.env` - Docker environment variables

## 🔄 Migration Notes

### Docker Compose
The `docker-compose.yml` file has been updated to reference Dockerfiles in the new location:
```yaml
dockerfile: docker/Dockerfile.frontend
dockerfile: docker/Dockerfile.backend
```

### Configuration Files
Some configuration files may need path updates if they reference moved files. Check:
- Build scripts
- CI/CD configurations
- Deployment scripts

## 📚 Related Documentation

- [README.md](../README.md) - Project overview
- [docs/README.md](README.md) - Documentation structure
- [DEPLOYMENT_BEST_PRACTICES.md](DEPLOYMENT_BEST_PRACTICES.md) - Deployment guide

---

**Last Updated**: 2024
**Maintained By**: TETRIX Development Team

