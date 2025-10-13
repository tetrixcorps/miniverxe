#!/bin/bash

# Git Workflow Helper Script for TETRIX Development
# Provides standardized commands for branch management and CI/CD

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if we're in a git repository
check_git_repo() {
    if [ ! -d ".git" ]; then
        print_error "Not in a git repository"
        exit 1
    fi
}

# Function to check if working directory is clean
check_clean_working_dir() {
    if [ -n "$(git status --porcelain)" ]; then
        print_error "Working directory is not clean. Please commit or stash changes first."
        git status --short
        exit 1
    fi
}

# Function to create a new feature branch
create_feature_branch() {
    local feature_name=$1
    if [ -z "$feature_name" ]; then
        print_error "Feature name is required"
        echo "Usage: $0 feature <feature-name>"
        exit 1
    fi
    
    check_git_repo
    check_clean_working_dir
    
    local branch_name="feature/$feature_name"
    
    print_status "Creating feature branch: $branch_name"
    
    # Start from dev branch
    git checkout dev
    git pull origin dev
    git checkout -b "$branch_name"
    
    print_success "Feature branch '$branch_name' created and checked out"
    print_status "Ready for development. Make your changes and commit them."
}

# Function to create a new fix branch
create_fix_branch() {
    local fix_name=$1
    if [ -z "$fix_name" ]; then
        print_error "Fix name is required"
        echo "Usage: $0 fix <fix-name>"
        exit 1
    fi
    
    check_git_repo
    check_clean_working_dir
    
    local branch_name="fix/$fix_name"
    
    print_status "Creating fix branch: $branch_name"
    
    # Start from dev branch
    git checkout dev
    git pull origin dev
    git checkout -b "$branch_name"
    
    print_success "Fix branch '$branch_name' created and checked out"
    print_status "Ready for bug fixes. Make your changes and commit them."
}

# Function to merge feature to dev
merge_to_dev() {
    local current_branch=$(git branch --show-current)
    
    if [[ ! "$current_branch" =~ ^(feature|fix)/ ]]; then
        print_error "Current branch '$current_branch' is not a feature or fix branch"
        exit 1
    fi
    
    check_git_repo
    check_clean_working_dir
    
    print_status "Merging '$current_branch' to dev"
    
    # Switch to dev and merge
    git checkout dev
    git pull origin dev
    git merge "$current_branch" --no-ff -m "Merge $current_branch into dev"
    
    print_success "Merged '$current_branch' to dev"
    print_status "Pushing to remote..."
    
    git push origin dev
    
    print_success "Pushed to remote dev branch"
    print_status "You can now delete the feature branch: git branch -d $current_branch"
}

# Function to sync dev with main
sync_dev_with_main() {
    check_git_repo
    check_clean_working_dir
    
    print_status "Syncing dev with main"
    
    git checkout dev
    git pull origin dev
    git merge main --no-ff -m "Sync dev with main: $(date)"
    
    print_success "Synced dev with main"
    print_status "Pushing to remote..."
    
    git push origin dev
    
    print_success "Dev branch synced with main"
}

# Function to deploy to staging
deploy_to_staging() {
    check_git_repo
    check_clean_working_dir
    
    print_status "Deploying dev to staging"
    
    git checkout staging
    git pull origin staging
    git merge dev --no-ff -m "Deploy dev to staging: $(date)"
    
    print_success "Merged dev to staging"
    print_status "Pushing to remote staging..."
    
    git push origin staging
    
    print_success "Staging deployment initiated"
    print_status "Check GitHub Actions for deployment status"
}

# Function to deploy to production
deploy_to_production() {
    check_git_repo
    check_clean_working_dir
    
    print_status "Deploying staging to production"
    
    git checkout main
    git pull origin main
    git merge staging --no-ff -m "Deploy staging to production: $(date)"
    
    print_success "Merged staging to main"
    print_status "Pushing to remote main..."
    
    git push origin main
    
    print_success "Production deployment initiated"
    print_status "Check GitHub Actions for deployment status"
}

# Function to show current status
show_status() {
    print_status "Current Git Status:"
    echo ""
    
    # Current branch
    local current_branch=$(git branch --show-current)
    print_status "Current branch: $current_branch"
    
    # Status
    git status --short
    
    echo ""
    print_status "Recent commits:"
    git log --oneline -5
    
    echo ""
    print_status "Branch status:"
    git for-each-ref --format='%(refname:short) %(committerdate:relative) %(subject)' refs/heads/ | sort -k2
}

# Function to show help
show_help() {
    echo "TETRIX Git Workflow Helper"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  feature <name>     Create a new feature branch"
    echo "  fix <name>         Create a new fix branch"
    echo "  merge-dev          Merge current feature/fix branch to dev"
    echo "  sync-dev           Sync dev branch with main"
    echo "  deploy-staging     Deploy dev to staging"
    echo "  deploy-prod        Deploy staging to production"
    echo "  status             Show current git status"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 feature user-authentication"
    echo "  $0 fix login-bug"
    echo "  $0 merge-dev"
    echo "  $0 deploy-staging"
    echo ""
    echo "Branch Strategy:"
    echo "  main (production) ← staging (pre-production) ← dev (development) ← feature branches"
}

# Main command handling
case "$1" in
    feature)
        create_feature_branch "$2"
        ;;
    fix)
        create_fix_branch "$2"
        ;;
    merge-dev)
        merge_to_dev
        ;;
    sync-dev)
        sync_dev_with_main
        ;;
    deploy-staging)
        deploy_to_staging
        ;;
    deploy-prod)
        deploy_to_production
        ;;
    status)
        show_status
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
