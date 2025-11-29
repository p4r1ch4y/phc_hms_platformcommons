# repository analysis prompt for github copilot agent

this document contains a comprehensive prompt that can be used with github copilot agent (or similar ai code assistants) to analyze the phc hms repository. copy and paste the entire prompt below into your agent interface.

---

## prompt

analyze this repository as a production-grade, multi-tenant hospital management system (hms) / phc saas product and give me a detailed, actionable report.

goals:
- improve security, reliability, and maintainability
- ensure it is safe and scalable enough for a real-world hms
- suggest concrete code changes and new features

tasks:

### 1) codebase scan and quality
- scan the entire codebase (frontend, backend, infra) for:
  - code smells, anti-patterns, dead code, duplicate logic
  - missing error handling, logging, and input validation
  - inconsistent patterns in api handlers, services, and components
- run or simulate lint checks and formatting checks and report:
  - files or folders not following the project linting/formatting standards
  - common issues (any, implicit any, unused vars, unsafe type casts, etc. if typescript)
- suggest a consistent coding standard and give examples of how to refactor representative files.

### 2) security review (backend, sql, prisma, auth)
- review all prisma schema files, migrations, and raw sql queries for:
  - multi-tenancy isolation (per-tenant schema or tenant id usage)
  - protection against sql injection and unsafe query patterns
  - proper use of indexes, constraints, and foreign keys
- check auth and access control:
  - how roles (patient, doctor, nurse, admin, lab, pharmacy, asha, etc.) are modeled
  - whether role-based access control is enforced correctly in apis and ui
  - any direct object reference issues (accessing resources from other tenants)
- highlight any risky patterns, especially around:
  - user input handling
  - session or token handling
  - password or secret management
- rate overall backend and db security for an hms from 1–10 and justify the score.

### 3) compliance and data protection mindset
(note: you cannot legally certify compliance, but use best practices)
- check whether the system design shows awareness of:
  - patient data privacy
  - audit logging for sensitive actions
  - data minimization and access control
- point out missing pieces that are important for healthcare:
  - audit trails (who did what and when)
  - data retention strategy
  - consent flows, or at least structure to add them later

### 4) architecture and performance
- assess the current architecture:
  - is it modular enough for a multi-tenant saas hms?
  - any tight coupling between frontend and backend that should be decoupled?
- identify performance risks:
  - n+1 queries
  - missing pagination on large lists (patients, appointments, logs, etc.)
  - heavy computations in request handlers
- suggest:
  - improvements to layering (controllers/services/repositories)
  - caching opportunities
  - background job candidates (report generation, sync tasks, etc.)

### 5) feature review and improvement ideas
- based on the current code, list:
  - what core hms features are implemented (registration, vitals, consultation, prescription, pharmacy, lab, billing, reports, etc.)
  - what is partially implemented
  - what is missing for a basic phc-focused hms
- propose a prioritized feature roadmap with 2–3 tiers:
  - must-have for mvp (for a live phc)
  - nice-to-have for better usability
  - advanced features (ai, ocr, offline sync, multilingual, dashboards, etc.)
- for each suggested feature, mention:
  - which files/modules to touch
  - a rough implementation approach

### 6) frontend ux/ui and reliability
- review the frontend for:
  - clarity of workflows (patient registration → vitals → consultation → prescription)
  - accessibility basics (contrast, focus states, form validation, error messages)
  - error handling and loading states for api calls
- point out:
  - screens or flows that are confusing or incomplete
  - places where optimistic updates, skeleton loaders, or better validation would help
- propose 3–5 concrete ui/ux improvements that can be implemented quickly.

### 7) output format
- provide the final answer structured as:
  - summary (short)
  - section 1: code quality findings + fixes
  - section 2: security & db review (with examples)
  - section 3: architecture & performance
  - section 4: feature gaps & roadmap
  - section 5: frontend ux/ui improvements
- wherever possible, reference specific files, functions, or components and show short code snippets or pseudo-diffs to demonstrate improvements.

---

## how to use

1. open github copilot agent (or workspace chat)
2. copy the entire prompt above (from "analyze this repository..." to the end)
3. paste it into the agent input
4. wait for the comprehensive analysis report
5. review findings and prioritize fixes based on severity

## additional focused prompts

### quick security scan
```
scan this hms repository for security vulnerabilities focusing on:
- sql injection risks in prisma queries and raw sql
- authentication and authorization flaws
- multi-tenant data isolation issues
- hardcoded secrets or credentials
- input validation gaps
provide a prioritized list of findings with severity ratings.
```

### lint and code quality check
```
run a code quality analysis on this repository:
- identify typescript errors and warnings
- find unused variables, imports, and dead code
- check for consistent naming conventions
- identify missing error handling
- suggest refactoring opportunities
list all findings by file with suggested fixes.
```

### database schema review
```
review all prisma schema files and sql scripts in this repository:
- check for proper indexing on frequently queried fields
- verify foreign key relationships and constraints
- assess multi-tenant isolation strategy
- identify potential n+1 query patterns
- suggest schema optimizations for hms workloads
```

### feature gap analysis
```
analyze the current hms implementation and identify:
- which core phc features are complete
- which features are partially implemented
- critical missing features for a production hms
provide a prioritized feature roadmap for mvp launch.
```

### api security audit
```
audit all api endpoints in this repository for:
- proper authentication middleware usage
- role-based access control enforcement
- input validation and sanitization
- rate limiting and abuse prevention
- error handling that doesn't leak sensitive info
list vulnerable endpoints with remediation steps.
```

---

## notes

- this prompt is designed specifically for multi-tenant hospital management systems
- adjust the focus areas based on your current development phase
- run this analysis periodically (e.g., before major releases)
- use the focused prompts above for quick targeted checks
