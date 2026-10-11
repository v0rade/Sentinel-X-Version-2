# Security Policy — SENTINEL X Platform

## Supported Deployment Model
SENTINEL X is built with multi-tenant architecture, server-side RBAC authorization guards, deterministic SIEM correlation, and append-only audit ledgers.

## Threat Assumptions & Scope
- **Synthetic Test Data**: All training lab scenarios (Hydra brute-force, password spraying, role escalation) operate exclusively against isolated, synthetic test data and RFC 5737 documentation networks (`198.51.100.0/24`, `203.0.113.0/24`, `192.0.2.0/24`).
- **No Remote Exploitation**: Sentinel X does not execute external port scans, denial of service tools, or real exploit payloads against untrusted infrastructure.
- **Credential Storage**: Passwords are hashed using bcrypt/argon2id. Passwords, API tokens, and JWTs are never recorded in audit trail logs or telemetry details.

## Role-Based Access Control (RBAC)
Authorization is strictly validated on the server for all protected API endpoints:
- `SUPER_ADMIN`: Organization creation, global policy configurations.
- `SECURITY_ADMIN`: Policy tuning, security integrations, user access.
- `SOC_ANALYST`: Telemetry review, alert triage, incident response.
- `SECURITY_ENGINEER`: Vulnerability management, asset inventory, scanner integration.
- `DEVELOPER`: Application findings review, remediation updates.
- `AUDITOR`: Read-only access to immutable audit records.
- `LAB_USER`: Sandboxed training scenarios.

## Reporting a Security Vulnerability
If you discover a vulnerability in Sentinel X, please submit an issue to `security@sentinel.internal`. Do not publicly disclose vulnerabilities before a patch has been coordinated.
