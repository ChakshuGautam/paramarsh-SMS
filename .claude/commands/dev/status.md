---
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git branch:*), Bash(npm test:*), Read
description: Quick development status overview
---

# Development Status Overview

Get a comprehensive overview of the current development state.

## Git Status
!`git status --short`

## Current Branch
!`git branch --show-current`

## Recent Commits
!`git log --oneline -5`

## Modified Files Summary
!`git diff --stat`

## Test Coverage Check
Check if tests are passing for key modules.

## Analysis Tasks

Based on the status information:
1. Summarize what's currently being worked on
2. Identify any uncommitted changes that need attention
3. Check for any merge conflicts or issues
4. Verify tests are passing for modified modules
5. Suggest next steps in the development workflow

## References
- Check @.claude/ISSUES_AND_LEARNINGS.md for any related issues
- Review @CLAUDE.md for relevant patterns
- Verify compliance with coding standards