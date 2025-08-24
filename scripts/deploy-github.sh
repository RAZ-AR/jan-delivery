#!/usr/bin/env bash
set -euo pipefail

# Create a GitHub repo and push current project using a PAT
# Usage:
#   GITHUB_TOKEN=ghp_xxx ./scripts/deploy-github.sh [repo-name]
# Notes:
# - Requires curl, git, and node (to parse JSON) installed
# - Token must have repo scope

REPO_NAME=${1:-jan-delivery}

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "ERROR: GITHUB_TOKEN env var is required (with repo scope)" >&2
  exit 1
fi

echo "Creating GitHub repo: $REPO_NAME"
RESP=$(curl -sS -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -X POST https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"private\":false}")

if echo "$RESP" | rg -q '"message":\s*"Bad credentials"'; then
  echo "ERROR: Bad credentials (invalid GITHUB_TOKEN)" >&2
  exit 1
fi

OWNER=$(node -e "const r=JSON.parse(process.argv[1]);console.log(r.owner?.login||'')" "$RESP")
CLONE_URL=$(node -e "const r=JSON.parse(process.argv[1]);console.log(r.clone_url||'')" "$RESP")

if [[ -z "$OWNER" || -z "$CLONE_URL" ]]; then
  echo "ERROR: Failed to create repo or parse response:" >&2
  echo "$RESP" >&2
  exit 1
fi

echo "Repo created: https://github.com/$OWNER/$REPO_NAME"

echo "Initializing local git (if needed)"
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || git init
git add .
git commit -m "chore: initial deploy setup" 2>/dev/null || true
git branch -M main 2>/dev/null || true

# Push using token without storing it in remote config
PUSH_URL="https://$GITHUB_TOKEN@github.com/$OWNER/$REPO_NAME.git"
echo "Pushing to GitHub (main)"
git push "$PUSH_URL" main:main

# Set clean remote URL (without token)
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$OWNER/$REPO_NAME.git"

echo "Done. Repo: https://github.com/$OWNER/$REPO_NAME"

