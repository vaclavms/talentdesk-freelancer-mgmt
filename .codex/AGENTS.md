# AGENTS.md — OpenClaw Prototype Quality Guide

## Project: talentdesk-prototype
## Stack: next.js (app router, route handlers) / TypeScript

## Core Features
- Freelancer & Vendor Directory: Single searchable registry for freelancers and vendors with CRUD fields: name, email, role/type, status, hourly rate, currency, start/end dates, and compliance flags.
- Onboarding Tracker: Checklist-based onboarding per freelancer/vendor (contract signed, tax form received, NDA complete, payment method set) with completion percentage and status transitions.
- Project Assignment & Costing: Assign freelancers to projects with bill rate, estimated hours, and date range; auto-calculate planned cost per assignment and aggregate per project.
- Budget Dashboard: View budget vs. planned spend vs. actual paid amount by project and by month, with over-budget highlighting for quick operational decisions.
- Budget Reporting API Export: Generate JSON/CSV-ready budget report payloads from an API endpoint for external accounting tools or manual downloads.

## MANDATORY Quality Requirements
1. All dependencies must be declared in package.json / requirements.txt
2. `# framework-specific build` must succeed without errors
3. Include at least 3 tests covering core functionality
4. No hardcoded API keys or secrets — use .env.example
5. Include a deploy-ready config (Dockerfile, vercel.json, or equivalent)
6. README.md must have: Setup, Run, Test, Deploy sections
7. Every file you create must have a clear purpose

## Code Style
- Follow standard conventions for the framework

## Forbidden Patterns
- No `any` types (TypeScript) or missing type hints (Python)
- No `eval()` or dynamic code execution
- No hardcoded URLs, API keys, or credentials
- No `console.log` for error handling — use proper error types/logging
- No installing packages globally
- No modifying files outside this project directory

## Testing Requirements
- Use the standard test runner: `# framework-specific test`
- Minimum 3 tests: happy path, error path, edge case
- Tests must be runnable with a single command
- Do NOT use mocks for core logic — test real behavior

## Definition of Done
Before finishing, verify ALL items:
- [ ] All imports resolve (`# framework-specific build` succeeds)
- [ ] `# framework-specific lint` passes with zero errors
- [ ] `# framework-specific test` passes
- [ ] .env.example lists all required environment variables
- [ ] README.md is complete with setup/run/test/deploy instructions
- [ ] No TODO comments left unresolved in critical paths
