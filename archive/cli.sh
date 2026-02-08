#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/dingemoe/app_react_userscript"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: not inside a git repository." >&2
  exit 1
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

BRANCH="${BRANCH:-$(git rev-parse --abbrev-ref HEAD)}"

# Stage and commit if there are changes
if ! git diff --quiet || ! git diff --cached --quiet; then
  git add -A
  if ! git diff --cached --quiet; then
    git commit -m "sync"
  fi
fi

git push -u origin "$BRANCH"
