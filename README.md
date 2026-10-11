# SENTINEL X — Cybersecurity Operations & Threat Intelligence Platform

SENTINEL X is an enterprise-grade, portfolio-worthy cybersecurity operations platform combining modern SOC monitoring, a SIEM-inspired detection engine, incident response management, vulnerability remediation, asset inventories, threat intelligence, and an interactive attack simulation lab.

---

## Key Differentiators & Architectures

1. **Deterministic SIEM Detection Engine**
   - Ingests normalized security events and evaluates them against rules mapped to the MITRE ATT&CK framework (T1110.001 Brute Force, T1110.003 Password Spraying, T1078 Privilege Escalation, T1499 Rate Violations).
   - Automatically clusters events and opens alerts with full evidence linkages.

2. **Interactive Attack Simulation Lab (Safe Training Sandboxes)**
   - Allows analysts to trigger synthetic scenarios (e.g. Hydra-style brute force, distributed password spraying, unauthorized privilege escalation).
   - Generates synthetic events on RFC-reserved IP addresses (`198.51.100.0/24`) and watches alerts fire in real time.

3. **Multi-Stage Incident Response Workspace**
   - Active incident tracking across lifecycle states (`OPEN`, `TRIAGED`, `CONTAINMENT`, `CLOSED`).
   - Chronological forensic timeline and interactive remediation checklists.

4. **Vulnerability Management & Risk Acceptance**
   - Comprehensive vulnerability ledger with CVSS scoring, CVE references, SAST/SCA sources, and due dates.
   - Formal Risk Acceptance workflow requiring mandatory technical justifications for audit compliance.

5. **Granular RBAC & Multi-Tenancy**
   - 7 distinct roles: `SUPER_ADMIN`, `SECURITY_ADMIN`, `SOC_ANALYST`, `SECURITY_ENGINEER`, `DEVELOPER`, `AUDITOR`, and `LAB_USER`.
   - Real-time role switcher in the bottom navigation for instant live demonstration of permission guards.

6. **Immutable Audit Trail**
   - Append-only compliance ledger recording logins, alert triage, incident updates, lab runs, and report exports with automated credential redaction.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Database & ORM**: PostgreSQL / SQLite, Prisma ORM
- **Security & Auth**: JWT HTTP-only sessions, bcrypt password hashing, server-side RBAC
- **Styling**: Tailwind CSS, Dark Navy SOC theme
- **Icons**: Lucide React

---

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Sync database schema
npx prisma db push

# 3. Seed realistic security data
npx tsx prisma/seed.ts

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Seed Accounts (All using password: `SentinelX#2026Secure!`)

- **Super Admin**: `admin@sentinel.internal`
- **Security Admin**: `sec-admin@sentinel.internal`
- **SOC Analyst**: `analyst@sentinel.internal`
- **Security Engineer**: `engineer@sentinel.internal`
- **Developer**: `dev@sentinel.internal`
- **Auditor**: `auditor@sentinel.internal`
- **Lab User**: `lab@sentinel.internal`

*(You can also use the interactive dropdown in the lower left navigation to switch roles on the fly).*
