#!/bin/bash

# Colors for premium console logging
GREEN='\033[0;32m'
BLUE='\033[0;34m'
AMBER='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== CívicaOS Git Sync Utility ===${NC}"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${AMBER}Initializing new Git repository in workspace...${NC}"
    git init
    git branch -M main
fi

# Check if remote exists
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
if [ -z "$REMOTE_URL" ]; then
    echo -e "${RED}⚠️ No git remote 'origin' configured yet!${NC}"
    echo -e "Please configure your GitHub repository remote url."
    echo -e "Example run command:"
    echo -e "  ${BLUE}git remote add origin <your-github-repo-url>${NC}"
    echo -e "Once configured, this sync script will automatically push."
    echo ""
fi

# Stage changes
echo -e "${BLUE}Staging changes...${NC}"
git add .

# Check if there are any staged changes to commit
if git diff --quiet --cached; then
    echo -e "${GREEN}No changes to commit. Working tree is clean.${NC}"
    exit 0
fi

# Commit changes
COMMIT_MSG="$1"
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Sync updates: $(date '+%Y-%m-%d %H:%M:%S')"
fi

echo -e "${BLUE}Committing with message: ${AMBER}\"${COMMIT_MSG}\"${NC}"
git commit -m "$COMMIT_MSG"

# Try to push if remote is configured
if [ ! -z "$REMOTE_URL" ]; then
    CURRENT_BRANCH=$(git branch --show-current)
    echo -e "${BLUE}Pushing changes to origin/${CURRENT_BRANCH}...${NC}"
    git push origin "$CURRENT_BRANCH"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully synchronized with GitHub!${NC}"
    else
        echo -e "${RED}❌ Push failed. Please verify your internet connection or git ssh keys.${NC}"
    fi
else
    echo -e "${AMBER}⚠️ Changes committed locally, but not pushed because origin is not configured yet.${NC}"
fi
