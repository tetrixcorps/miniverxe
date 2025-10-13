# Branch Protection Rules

## Branch Strategy

### Main Branch (Production)
- **Purpose**: Production-ready code
- **Protection**: Required
- **Requirements**:
  - Require pull request reviews (2 reviewers)
  - Require status checks to pass
  - Require branches to be up to date
  - Require linear history
  - Restrict pushes to main branch
  - Allow force pushes: ❌
  - Allow deletions: ❌

### Staging Branch (Pre-Production)
- **Purpose**: Pre-production testing
- **Protection**: Recommended
- **Requirements**:
  - Require pull request reviews (1 reviewer)
  - Require status checks to pass
  - Allow force pushes: ✅ (for CI/CD)
  - Allow deletions: ❌

### Dev Branch (Development)
- **Purpose**: Development integration
- **Protection**: Basic
- **Requirements**:
  - Require status checks to pass
  - Allow force pushes: ✅ (for feature integration)
  - Allow deletions: ❌

## CI/CD Integration

### GitHub Actions Required Status Checks
- `lint-and-typecheck`
- `test` (all test suites)
- `build`
- `security`

### Deployment Triggers
- **Staging**: Auto-deploy on push to `staging` branch
- **Production**: Auto-deploy on push to `main` branch
- **Manual**: Workflow dispatch for controlled deployments

## Branch Naming Conventions

### Feature Branches
- `feature/description` - New features
- `fix/description` - Bug fixes
- `hotfix/description` - Critical production fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates

### Example Workflow
1. Create feature branch from `dev`
2. Develop and test locally
3. Push to remote and create PR to `dev`
4. After review, merge to `dev`
5. Test in staging environment
6. Create PR from `dev` to `staging`
7. After staging tests, create PR to `main`
8. Deploy to production

## Security Considerations

- All branches require security scanning
- No direct pushes to main without PR
- All deployments require approval for production
- Secrets management for different environments
- Audit trail for all changes
