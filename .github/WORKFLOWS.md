# GitHub Actions Workflows

This document describes the automated workflows configured for this repository.

## 🚀 CI Workflow (`ci.yml`)

**Triggers**: Push to `main`, Pull requests to `main`

**Purpose**: Continuous Integration - validates code quality and tests

### Jobs

#### 1. **test** (Multi-version Node.js on Ubuntu)
- Tests on Node.js 18.x, 20.x, 22.x
- Runs: lint, type-check, format-check, unit tests, integration tests, build
- Primary validation for all changes

#### 2. **test-multiplatform** (Cross-platform testing)
- Tests on macOS and Windows with Node.js 22.x
- Ensures cross-platform compatibility
- Runs: tests and build only

#### 3. **coverage** (Code coverage reporting)
- Generates test coverage reports
- Uploads to Codecov (optional)
- Helps track test coverage over time

**No permissions required** - Runs automatically on all PRs

---

## 🔍 PR Validation Workflow (`pr-validation.yml`)

**Triggers**: Pull request opened, synchronized, reopened, or edited

**Purpose**: Validate PR quality and enforce standards

### Jobs

#### 1. **validate**
- **Conventional Commits**: Validates PR title follows format (`feat:`, `fix:`, etc.)
- **Merge Conflicts**: Detects merge conflicts with base branch
- **PR Size**: Reports statistics and warns on large PRs (>1000 lines)

#### 2. **label**
- Automatically labels PRs based on changed files
- Labels include:
  - `area: runtime` - Runtime-related changes
  - `area: browser` - Browser tool changes
  - `area: code-interpreter` - Code interpreter changes
  - `type: docs` - Documentation changes
  - `type: test` - Test changes
  - `type: build` - Build/CI changes
  - `type: examples` - Example changes
  - `dependencies` - Dependency updates

**Permissions**: `contents: read`, `pull-requests: write` for auto-labeling

---

## 🔒 Security Workflow (`security.yml`)

**Triggers**:
- Push to `main`, Pull requests to `main`
- Weekly schedule (Mondays at 00:00 UTC)

**Purpose**: Automated security scanning

### Jobs

#### 1. **audit** (npm audit)
- Runs `npm audit` to check for known vulnerabilities
- Checks both all dependencies and production-only
- Fails on high-severity issues in production dependencies

#### 2. **codeql** (CodeQL Analysis)
- GitHub's semantic code analysis for security vulnerabilities
- Analyzes JavaScript/TypeScript code
- Uploads results to Security tab

#### 3. **dependency-review** (PR only)
- Reviews dependency changes in PRs
- Checks for vulnerabilities in new/updated dependencies
- Fails on high-severity vulnerabilities

**Permissions**: `security-events: write` for CodeQL

---

## 🛡️ CodeQL Advanced Workflow (`codeql.yml`)

**Triggers**:
- Push to `main`, Pull requests to `main`
- Weekly schedule (Mondays at 02:00 UTC)

**Purpose**: Advanced security analysis with additional queries

### Features
- Extended query suite (`security-and-quality`)
- 360-minute timeout for comprehensive analysis
- JavaScript/TypeScript analysis
- Results appear in Security → Code scanning alerts

**Permissions**: `security-events: write`, `packages: read`

---

## 🧹 Stale Workflow (`stale.yml`)

**Triggers**:
- Daily schedule (01:00 UTC)
- Manual trigger via workflow_dispatch

**Purpose**: Automatically close inactive issues and PRs

### Configuration

#### Issues
- Marked stale after **60 days** of inactivity
- Closed after **7 days** of being marked stale
- Exempt labels: `pinned`, `security`, `roadmap`

#### Pull Requests
- Marked stale after **30 days** of inactivity
- Closed after **7 days** of being marked stale
- Exempt labels: `pinned`, `security`, `in-progress`

**Permissions**: `issues: write`, `pull-requests: write`

---

## 📋 Auto-labeler Configuration (`labeler.yml`)

Defines rules for automatically labeling PRs based on file paths:

```yaml
# Runtime changes
'area: runtime': src/runtime/**/*

# Browser tool changes
'area: browser': src/tools/browser/**/*

# Code interpreter changes
'area: code-interpreter': src/tools/code-interpreter/**/*

# Documentation
'type: docs': **/*.md

# Tests
'type: test': **/*.test.ts

# Build/CI
'type: build': package.json, tsconfig.json, .github/**/*

# Examples
'type: examples': examples/**/*

# Dependencies
'dependencies': package.json, package-lock.json
```

---

## 🎯 Benefits

### ✅ No Additional Permissions Required
All workflows use standard GitHub Actions permissions and run automatically without requiring secrets or tokens.

### ✅ Comprehensive Coverage
- **Quality**: Linting, type-checking, formatting
- **Testing**: Unit + integration tests across platforms
- **Security**: Multiple layers (audit, CodeQL, dependency review)
- **Automation**: Auto-labeling, stale issue management

### ✅ Fast Feedback
- CI runs complete in ~5 minutes
- PR validation provides immediate feedback
- Security scans run weekly + on-demand

### ✅ Cross-platform Validation
Tests run on:
- **Ubuntu** (primary platform)
- **macOS** (ensures Mac compatibility)
- **Windows** (ensures Windows compatibility)

### ✅ Node.js Version Matrix
Tests across Node.js LTS versions:
- **18.x** - Active LTS
- **20.x** - Active LTS
- **22.x** - Current

---

## 📊 Status Badges

Add these to your README.md:

```markdown
[![CI](https://github.com/YOUR_ORG/YOUR_REPO/workflows/CI/badge.svg)](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/ci.yml)
[![CodeQL](https://github.com/YOUR_ORG/YOUR_REPO/workflows/CodeQL%20Advanced/badge.svg)](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/codeql.yml)
[![Security](https://github.com/YOUR_ORG/YOUR_REPO/workflows/Security/badge.svg)](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/security.yml)
```

---

## 🔧 Customization

### Adjust Node.js Versions
Edit `ci.yml` matrix:
```yaml
matrix:
  node-version: [18.x, 20.x, 22.x]  # Add/remove versions
```

### Change Stale Timeouts
Edit `stale.yml`:
```yaml
days-before-issue-stale: 60   # Days before marking stale
days-before-issue-close: 7    # Days before closing
```

### Add/Remove Labels
Edit `.github/labeler.yml` to customize auto-labeling rules.

### Disable Workflows
To temporarily disable a workflow, add to the workflow file:
```yaml
on:
  workflow_dispatch:  # Only manual triggers
```

---

## 🚨 Troubleshooting

### Workflow Not Running?
1. Check branch protection rules
2. Verify workflow file syntax with `yamllint`
3. Check Actions → Workflows to see if disabled

### Tests Failing?
1. Run locally: `npm test && npm run test:integ`
2. Check Node.js version: `node --version`
3. Review CI logs for specific errors

### Security Alerts?
1. Check Security → Code scanning alerts
2. Run `npm audit` locally
3. Update vulnerable dependencies

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [npm audit](https://docs.npmjs.com/cli/v10/commands/npm-audit)
