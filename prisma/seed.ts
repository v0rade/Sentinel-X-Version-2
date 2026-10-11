import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('⚡ Seeding SENTINEL X Security Platform database...');

  // 1. Create Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'acme-cyber-defense' },
    update: {},
    create: {
      name: 'Acme Global Defense Corp',
      slug: 'acme-cyber-defense',
      description: 'Primary production enterprise defense boundary and SOC operations tier.',
    },
  });

  console.log(`✓ Organization ready: ${org.name} (${org.id})`);

  // 2. Create Users across all roles
  const passwordHash = await bcrypt.hash('SentinelX#2026Secure!', 10);

  const usersData = [
    {
      email: 'admin@sentinel.internal',
      name: 'Marcus Vance',
      title: 'Principal Security Architect & Super Admin',
      role: 'SUPER_ADMIN',
    },
    {
      email: 'sec-admin@sentinel.internal',
      name: 'Diana Prince',
      title: 'Security Operations Director',
      role: 'SECURITY_ADMIN',
    },
    {
      email: 'analyst@sentinel.internal',
      name: 'Sarah Chen',
      title: 'Senior SOC Analyst',
      role: 'SOC_ANALYST',
    },
    {
      email: 'engineer@sentinel.internal',
      name: 'Alex Rivera',
      title: 'Lead Application Security Engineer',
      role: 'SECURITY_ENGINEER',
    },
    {
      email: 'dev@sentinel.internal',
      name: 'David Kim',
      title: 'Senior Backend Developer',
      role: 'DEVELOPER',
    },
    {
      email: 'auditor@sentinel.internal',
      name: 'Elena Rostova',
      title: 'Compliance & IT Systems Auditor',
      role: 'AUDITOR',
    },
    {
      email: 'lab@sentinel.internal',
      name: 'Trainee Jordan',
      title: 'Junior Cyber Defense Trainee',
      role: 'LAB_USER',
    },
  ];

  const createdUsers: Record<string, any> = {};

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        title: u.title,
        passwordHash,
      },
    });

    createdUsers[u.role] = user;

    await prisma.organizationMembership.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: org.id,
        },
      },
      update: { role: u.role },
      create: {
        userId: user.id,
        organizationId: org.id,
        role: u.role,
      },
    });
  }
  console.log('✓ Provisioned 7 users across all RBAC tiers');

  // 3. Create Detection Rules (MITRE ATT&CK mapped)
  const rules = [
    {
      name: 'Multiple Consecutive Failed Authentications (Brute Force)',
      description: 'Detects 5 or more failed login attempts against a single test identity within 5 minutes.',
      ruleCategory: 'AUTH_ANOMALY',
      severity: 'HIGH',
      mitreTechniqueId: 'T1110.001',
      mitreTactic: 'Credential Access',
      evalWindowSecs: 300,
      threshold: 5,
      detectionLogic: JSON.stringify({ category: 'AUTH_FAILURE', groupBy: 'actorIdentity', window: 300, minCount: 5 }),
    },
    {
      name: 'Synthetic Password Spraying Pattern',
      description: 'Detects a single source IP attempting authentication across 3 or more distinct user accounts.',
      ruleCategory: 'AUTH_ANOMALY',
      severity: 'CRITICAL',
      mitreTechniqueId: 'T1110.003',
      mitreTactic: 'Credential Access',
      evalWindowSecs: 600,
      threshold: 3,
      detectionLogic: JSON.stringify({ category: 'AUTH_FAILURE', groupBy: 'sourceIp', distinctField: 'actorIdentity', threshold: 3 }),
    },
    {
      name: 'Unprompted Privileged IAM Elevation',
      description: 'Flags administrative role modifications or unapproved root execution triggers in test environments.',
      ruleCategory: 'PRIVILEGE_ABUSE',
      severity: 'CRITICAL',
      mitreTechniqueId: 'T1078',
      mitreTactic: 'Privilege Escalation',
      evalWindowSecs: 60,
      threshold: 1,
      detectionLogic: JSON.stringify({ category: 'PRIVILEGE_ESCALATION', threshold: 1 }),
    },
    {
      name: 'Excessive API Rate Limit Breaches',
      description: 'Monitors API endpoints for brute querying, scraping, or automated payload stuffing exceeding 10 throttles.',
      ruleCategory: 'RATE_VIOLATION',
      severity: 'MEDIUM',
      mitreTechniqueId: 'T1499',
      mitreTactic: 'Impact',
      evalWindowSecs: 180,
      threshold: 4,
      detectionLogic: JSON.stringify({ category: 'API_RATE_LIMIT', window: 180, threshold: 4 }),
    },
    {
      name: 'Unusual Out-of-Hours Administrative Action',
      description: 'Triggers when high-impact configuration changes occur outside approved change windows.',
      ruleCategory: 'AUTH_ANOMALY',
      severity: 'MEDIUM',
      mitreTechniqueId: 'T1098',
      mitreTactic: 'Persistence',
      evalWindowSecs: 3600,
      threshold: 1,
      detectionLogic: JSON.stringify({ category: 'SUSPICIOUS_ADMIN', threshold: 1 }),
    },
  ];

  const createdRules: any[] = [];
  for (const r of rules) {
    const existing = await prisma.detectionRule.findFirst({
      where: { organizationId: org.id, name: r.name },
    });
    if (existing) {
      createdRules.push(existing);
    } else {
      const created = await prisma.detectionRule.create({
        data: {
          ...r,
          organizationId: org.id,
        },
      });
      createdRules.push(created);
    }
  }
  console.log(`✓ Configured ${createdRules.length} SIEM detection rules`);

  // 4. Create Assets
  const assetsData = [
    {
      name: 'Sentinel Core Auth Gateway',
      assetType: 'API_SERVICE',
      environment: 'PRODUCTION',
      owner: 'SecOps Infrastructure',
      criticality: 'CRITICAL',
      securityClass: 'RESTRICTED',
      ipAddress: '10.0.12.4',
      hostname: 'auth-gw-prod.sentinel.internal',
      description: 'Central OAuth2 and JWT token minting gateway for all edge traffic.',
    },
    {
      name: 'Customer Portal Web App',
      assetType: 'WEB_APPLICATION',
      environment: 'PRODUCTION',
      owner: 'Frontend Engineering',
      criticality: 'HIGH',
      securityClass: 'CONFIDENTIAL',
      ipAddress: '10.0.14.88',
      hostname: 'portal.acme-defense.com',
      description: 'Next.js customer facing interface handling identity and tenant telemetry.',
    },
    {
      name: 'Primary PostgreSQL Defense Cluster',
      assetType: 'DATABASE',
      environment: 'PRODUCTION',
      owner: 'Data Engineering',
      criticality: 'CRITICAL',
      securityClass: 'RESTRICTED',
      ipAddress: '10.0.20.5',
      hostname: 'db-cluster-primary.internal',
      description: 'Encrypted storage for telemetry, customer accounts, and audit ledgers.',
    },
    {
      name: 'CI/CD Pipeline Runner Host',
      assetType: 'SERVER',
      environment: 'DEVELOPMENT',
      owner: 'DevOps / Platform',
      criticality: 'MEDIUM',
      securityClass: 'INTERNAL',
      ipAddress: '10.0.30.12',
      hostname: 'runner-node-03.internal',
      description: 'Ephemeral GitHub Actions / container build server.',
    },
    {
      name: 'Simulated Purple-Team Lab Fixture',
      assetType: 'LAB_ENVIRONMENT',
      environment: 'LAB',
      owner: 'Cyber Training Unit',
      criticality: 'LOW',
      securityClass: 'INTERNAL',
      ipAddress: '192.168.100.50',
      hostname: 'lab-target-sandbox.local',
      description: 'Intentionally isolated synthetic training target for SIEM alert verification.',
    },
  ];

  const createdAssets: any[] = [];
  for (const a of assetsData) {
    const asset = await prisma.asset.create({
      data: {
        ...a,
        organizationId: org.id,
        lastAssessmentDate: new Date(),
      },
    });
    createdAssets.push(asset);
  }
  console.log(`✓ Registered ${createdAssets.length} enterprise assets`);

  // 5. Create Applications
  const appData = [
    {
      name: 'Customer Defense Portal',
      repositoryUrl: 'https://github.com/acme/customer-defense-portal',
      framework: 'Next.js 15 (React 19)',
      tier: 'TIER_1_CRITICAL',
      securityScore: 88,
      lastScanAt: new Date(),
    },
    {
      name: 'Sentinel Ingestion Microservice',
      repositoryUrl: 'https://github.com/acme/sentinel-ingestion',
      framework: 'Express / TypeScript',
      tier: 'TIER_1_CRITICAL',
      securityScore: 94,
      lastScanAt: new Date(),
    },
    {
      name: 'Billing & Token Service',
      repositoryUrl: 'https://github.com/acme/billing-api',
      framework: 'FastAPI (Python)',
      tier: 'TIER_2_STANDARD',
      securityScore: 78,
      lastScanAt: new Date(),
    },
  ];

  const createdApps: any[] = [];
  for (const app of appData) {
    const created = await prisma.application.create({
      data: {
        ...app,
        organizationId: org.id,
      },
    });
    createdApps.push(created);
  }
  console.log(`✓ Registered ${createdApps.length} applications with posture metrics`);

  // 6. Create Realistic Security Events
  const eventsToCreate = [
    // Brute force series on admin
    {
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      sourceType: 'AUTH_SERVICE',
      sourceIdentifier: 'auth-gw-prod.sentinel.internal',
      eventCategory: 'AUTH_FAILURE',
      severity: 'MEDIUM',
      actorIdentity: 'admin@acme-defense.com',
      targetResource: '/api/v1/auth/login',
      sourceIp: '198.51.100.42',
      correlationId: 'corr-bf-001',
      eventDetails: JSON.stringify({ reason: 'Invalid credential provided', clientAgent: 'Mozilla/5.0 (Kali Linux Hydra)' }),
    },
    {
      timestamp: new Date(Date.now() - 24 * 60 * 1000),
      sourceType: 'AUTH_SERVICE',
      sourceIdentifier: 'auth-gw-prod.sentinel.internal',
      eventCategory: 'AUTH_FAILURE',
      severity: 'MEDIUM',
      actorIdentity: 'admin@acme-defense.com',
      targetResource: '/api/v1/auth/login',
      sourceIp: '198.51.100.42',
      correlationId: 'corr-bf-001',
      eventDetails: JSON.stringify({ reason: 'Invalid credential provided', attempt: 2 }),
    },
    {
      timestamp: new Date(Date.now() - 23 * 60 * 1000),
      sourceType: 'AUTH_SERVICE',
      sourceIdentifier: 'auth-gw-prod.sentinel.internal',
      eventCategory: 'AUTH_FAILURE',
      severity: 'HIGH',
      actorIdentity: 'admin@acme-defense.com',
      targetResource: '/api/v1/auth/login',
      sourceIp: '198.51.100.42',
      correlationId: 'corr-bf-001',
      eventDetails: JSON.stringify({ reason: 'Invalid credential provided', attempt: 3 }),
    },
    {
      timestamp: new Date(Date.now() - 22 * 60 * 1000),
      sourceType: 'AUTH_SERVICE',
      sourceIdentifier: 'auth-gw-prod.sentinel.internal',
      eventCategory: 'AUTH_FAILURE',
      severity: 'HIGH',
      actorIdentity: 'admin@acme-defense.com',
      targetResource: '/api/v1/auth/login',
      sourceIp: '198.51.100.42',
      correlationId: 'corr-bf-001',
      eventDetails: JSON.stringify({ reason: 'Invalid credential provided', attempt: 4 }),
    },
    {
      timestamp: new Date(Date.now() - 21 * 60 * 1000),
      sourceType: 'AUTH_SERVICE',
      sourceIdentifier: 'auth-gw-prod.sentinel.internal',
      eventCategory: 'ACCOUNT_LOCKOUT',
      severity: 'CRITICAL',
      actorIdentity: 'admin@acme-defense.com',
      targetResource: '/api/v1/auth/login',
      sourceIp: '198.51.100.42',
      correlationId: 'corr-bf-001',
      eventDetails: JSON.stringify({ reason: 'Account locked after 5 consecutive failures', lockoutWindowSecs: 900 }),
    },

    // Suspicious privilege escalation
    {
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      sourceType: 'APPLICATION',
      sourceIdentifier: 'customer-portal-node-01',
      eventCategory: 'PRIVILEGE_ESCALATION',
      severity: 'CRITICAL',
      actorIdentity: 'intern.tester@sentinel.internal',
      targetResource: '/api/v1/admin/roles/grant',
      sourceIp: '203.0.113.88',
      correlationId: 'corr-priv-002',
      eventDetails: JSON.stringify({ assignedRole: 'SUPER_ADMIN', requestedBy: 'intern.tester', authorizationMethod: 'Direct API invoke' }),
    },

    // Normal auth success
    {
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      sourceType: 'AUTH_SERVICE',
      sourceIdentifier: 'auth-gw-prod.sentinel.internal',
      eventCategory: 'AUTH_SUCCESS',
      severity: 'INFORMATIONAL',
      actorIdentity: 'sarah.chen@sentinel.internal',
      targetResource: '/dashboard',
      sourceIp: '10.0.1.55',
      correlationId: 'corr-norm-003',
      eventDetails: JSON.stringify({ mfaVerified: true, sessionType: 'WEB_CONSOLE' }),
    },

    // Rate limiting event
    {
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      sourceType: 'API_GATEWAY',
      sourceIdentifier: 'kong-gateway-edge',
      eventCategory: 'API_RATE_LIMIT',
      severity: 'MEDIUM',
      actorIdentity: 'anonymous-client',
      targetResource: '/api/v1/vulnerabilities/export',
      sourceIp: '198.51.100.99',
      correlationId: 'corr-rate-004',
      eventDetails: JSON.stringify({ requestCount: 250, limit: 100, window: '60s' }),
    },
  ];

  const createdEvents: any[] = [];
  for (const ev of eventsToCreate) {
    const created = await prisma.securityEvent.create({
      data: {
        ...ev,
        organizationId: org.id,
      },
    });
    createdEvents.push(created);
  }
  console.log(`✓ Ingested ${createdEvents.length} normalized security events`);

  // 7. Create Alerts linked to detection rules and events
  const alert1 = await prisma.alert.create({
    data: {
      organizationId: org.id,
      detectionRuleId: createdRules[0]?.id,
      assignedToUserId: createdUsers['SOC_ANALYST']?.id,
      title: 'Active Brute-Force Password Guessing Campaign',
      description: 'Multiple consecutive failed authentication attempts against privileged account admin@acme-defense.com from external IP 198.51.100.42.',
      severity: 'HIGH',
      status: 'INVESTIGATING',
      affectedAsset: 'auth-gw-prod.sentinel.internal',
      potentialImpact: 'High risk of credential compromise or service denial on identity provider.',
      evidenceSummary: '5 consecutive HTTP 401s followed by an account lockout event within 4 minutes. User-agent string corresponds to automated hydra scanner.',
      investigationNotes: 'Source IP 198.51.100.42 traced to untrusted hosting VPS. Account locked for 15 minutes. Verification with admin confirmed no legitimate login attempt from this location.',
      recommendedDefense: 'Add 198.51.100.42 to perimeter WAF blocklist, require biometric WebAuthn challenge, enforce CAPTCHA.',
      acknowledgedAt: new Date(Date.now() - 18 * 60 * 1000),
      alertEvents: {
        create: [
          { eventId: createdEvents[0].id },
          { eventId: createdEvents[1].id },
          { eventId: createdEvents[2].id },
          { eventId: createdEvents[4].id },
        ],
      },
    },
  });

  const alert2 = await prisma.alert.create({
    data: {
      organizationId: org.id,
      detectionRuleId: createdRules[2]?.id,
      assignedToUserId: createdUsers['SECURITY_ADMIN']?.id,
      title: 'Unauthorized Privilege Escalation to SUPER_ADMIN',
      description: 'Account intern.tester@sentinel.internal successfully triggered role elevation endpoint bypassing standard managerial approval workflow.',
      severity: 'CRITICAL',
      status: 'NEW',
      affectedAsset: 'customer-portal-node-01',
      potentialImpact: 'Total tenant compromise; unauthorized administrative rights granted.',
      evidenceSummary: 'Event logged at /api/v1/admin/roles/grant from IP 203.0.113.88 without valid dual-sign token.',
      recommendedDefense: 'Immediately revoke active sessions, revert role to LAB_USER, conduct source code review on /roles/grant validation logic.',
      alertEvents: {
        create: [{ eventId: createdEvents[5].id }],
      },
    },
  });
  console.log('✓ Created 2 active alerts with attached event evidence');

  // 8. Create Incident with Timeline and Response Tasks
  const incident = await prisma.incident.create({
    data: {
      referenceNumber: 'INC-2026-0042',
      organizationId: org.id,
      assignedToUserId: createdUsers['SOC_ANALYST']?.id,
      title: 'Targeted Credential Stuffing & Gateway Probing Campaign',
      description: 'Coordinated brute-force probing against core administrative accounts originated from known bulletproof VPS subnets.',
      severity: 'HIGH',
      status: 'CONTAINMENT',
      affectedAssets: 'Sentinel Core Auth Gateway, Customer Portal Web App',
      rootCause: 'Lack of progressive exponential backoff on legacy v1 auth endpoint prior to rate limiter activation.',
      remediationSummary: 'Perimeter firewall ACL updated to drop 198.51.100.0/24 subnet; accelerated rollout of mandatory FIDO2 hardware keys.',
      timelineEntries: {
        create: [
          {
            actionType: 'STATUS_CHANGE',
            title: 'Incident Triaged & Declared',
            details: 'SOC Analyst Sarah Chen escalated Alert "Active Brute-Force Password Guessing Campaign" into Severity HIGH incident.',
            actorName: 'Sarah Chen (Senior SOC Analyst)',
            timestamp: new Date(Date.now() - 20 * 60 * 1000),
          },
          {
            actionType: 'CONTAINMENT_ACTION',
            title: 'Offending IP Blocked at Edge WAF',
            details: 'WAF rule rule-drop-198-51 applied. Subsequent connection requests from 198.51.100.42 dropped with 403.',
            actorName: 'Diana Prince (Security Director)',
            timestamp: new Date(Date.now() - 14 * 60 * 1000),
          },
          {
            actionType: 'NOTE_ADDED',
            title: 'Analyst Investigation Note',
            details: 'Inspected authentication logs across preceding 24 hours. No successful logins occurred with compromised password hashes.',
            actorName: 'Sarah Chen (Senior SOC Analyst)',
            timestamp: new Date(Date.now() - 8 * 60 * 1000),
          },
        ],
      },
      tasks: {
        create: [
          {
            title: 'Validate the alert evidence and target accounts',
            description: 'Confirm target account status and verify no secondary session persistence.',
            isCompleted: true,
            completedAt: new Date(),
            sortOrder: 1,
            assignedToUserId: createdUsers['SOC_ANALYST']?.id,
          },
          {
            title: 'Apply perimeter containment firewall rule',
            description: 'Quarantine originating /24 CIDR block on AWS CloudFront / WAF.',
            isCompleted: true,
            completedAt: new Date(),
            sortOrder: 2,
            assignedToUserId: createdUsers['SECURITY_ADMIN']?.id,
          },
          {
            title: 'Preserve forensically sound auth gateway logs',
            description: 'Ship raw JSON access logs to cold tamper-evident S3 archive.',
            isCompleted: false,
            sortOrder: 3,
            assignedToUserId: createdUsers['SOC_ANALYST']?.id,
          },
          {
            title: 'Verify remediation and schedule retrospective',
            description: 'Test auth gateway latency and draft post-incident review document.',
            isCompleted: false,
            sortOrder: 4,
            assignedToUserId: createdUsers['SECURITY_ADMIN']?.id,
          },
        ],
      },
    },
  });

  // Link alert1 to this incident
  await prisma.alert.update({
    where: { id: alert1.id },
    data: { incidentId: incident.id },
  });
  console.log(`✓ Initialized Incident ${incident.referenceNumber} with timeline & response checklist`);

  // 9. Create Vulnerability Findings with Remediation Tasks
  const vuln1 = await prisma.vulnerabilityFinding.create({
    data: {
      findingReference: 'VULN-2026-101',
      organizationId: org.id,
      assetId: createdAssets[1]?.id,
      applicationId: createdApps[0]?.id,
      assignedEngineerId: createdUsers['SECURITY_ENGINEER']?.id,
      title: 'Server-Side Template Injection in Customer Notification Template Engine',
      description: 'User-controlled input is concatenated directly into Jinja2 / handlebars rendering context without prior escaping, allowing arbitrary code execution under node runner context.',
      severity: 'CRITICAL',
      status: 'IN_PROGRESS',
      cveId: 'CVE-2024-38077',
      cvssScore: 9.8,
      detectionSource: 'SEMGREP_SAST',
      remediationAdvice: 'Migrate to sanitized parameter bindings or pre-compiled sandbox rendering engine. Disallow custom template directives.',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      remediationTasks: {
        create: [
          {
            title: 'Refactor notification engine to use DOMPurify and strict AST parsing',
            description: 'Remove direct string eval and enforce strict schema on incoming variables.',
            status: 'IN_DEVELOPMENT',
            assignedTo: 'David Kim',
            targetRelease: 'v2.4.1',
          },
        ],
      },
    },
  });

  const vuln2 = await prisma.vulnerabilityFinding.create({
    data: {
      findingReference: 'VULN-2026-102',
      organizationId: org.id,
      assetId: createdAssets[0]?.id,
      applicationId: createdApps[1]?.id,
      assignedEngineerId: createdUsers['SECURITY_ENGINEER']?.id,
      title: 'Outdated jsonwebtoken Dependency Susceptible to Key Confusion',
      description: 'Version 8.5.1 of jsonwebtoken is bundled in production artifact; susceptible to algorithm confusion (HS256 vs RS256) when public key is treated as HMAC secret.',
      severity: 'HIGH',
      status: 'TRIAGED',
      cveId: 'CVE-2022-23529',
      cvssScore: 7.6,
      detectionSource: 'NPM_AUDIT',
      remediationAdvice: 'Upgrade jsonwebtoken to >= 9.0.0 and explicitly restrict allowed algorithms array to ["RS256"].',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      remediationTasks: {
        create: [
          {
            title: 'Bump jsonwebtoken package and enforce algorithm whitelist parameter',
            description: 'Validate verify() calls pass algorithms: ["RS256"] explicitly.',
            status: 'PENDING',
            assignedTo: 'David Kim',
            targetRelease: 'v2.4.2',
          },
        ],
      },
    },
  });

  const vuln3 = await prisma.vulnerabilityFinding.create({
    data: {
      findingReference: 'VULN-2026-103',
      organizationId: org.id,
      assetId: createdAssets[2]?.id,
      assignedEngineerId: createdUsers['SECURITY_ENGINEER']?.id,
      title: 'Missing TLS Certificate Revocation Checking on DB Replication Link',
      description: 'PostgreSQL standby replica connects without checking OCSP stapling or CRL revocation endpoints on TLS handshake.',
      severity: 'LOW',
      status: 'ACCEPTED_RISK',
      cveId: 'N/A',
      cvssScore: 3.1,
      detectionSource: 'MANUAL_ASSESSMENT',
      remediationAdvice: 'Enable sslcertmode=verify-full with local CRL bundle distribution.',
      riskAcceptedReason: 'Replication link traverses dedicated IPsec VPN tunnel with physical fiber isolation; risk judged acceptable by Security Committee.',
      verifiedAt: new Date(),
    },
  });
  console.log('✓ Created 3 realistic vulnerability findings with remediation links');

  // 10. Threat Intelligence Indicators (Explicitly synthetic labeled)
  const intelData = [
    {
      indicatorType: 'IP_ADDRESS',
      value: '198.51.100.42',
      source: 'SYNTHETIC_LAB',
      classification: 'SYNTHETIC_TRAINING',
      threatCategory: 'BRUTE_FORCE_NODE',
      confidence: 95,
      description: 'Synthetic training indicator representing automated credential spraying and dictionary hydra crawler.',
      analystNotes: 'Observed during Lab Scenario A and production test replay.',
    },
    {
      indicatorType: 'DOMAIN',
      value: 'malicious-simulated-c2.test',
      source: 'CIRCL_FEED_SIMULATED',
      classification: 'SYNTHETIC_TRAINING',
      threatCategory: 'C2_SIMULATION',
      confidence: 90,
      description: 'RFC 2606 reserved test domain representing adversary beaconing infrastructure.',
      analystNotes: 'Used for DNS exfiltration detection rule test bed.',
    },
    {
      indicatorType: 'FILE_HASH_SHA256',
      value: '275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f',
      source: 'ANALYST_SUBMITTED',
      classification: 'ANALYST_SUBMITTED',
      threatCategory: 'EXPLOIT_PAYLOAD',
      confidence: 85,
      description: 'Known EICAR test string equivalent SHA-256 hash used to verify endpoint AV sensor alert pipeline.',
      analystNotes: 'Safe synthetic hash for verification.',
    },
  ];

  for (const intel of intelData) {
    await prisma.threatIndicator.create({
      data: {
        ...intel,
        organizationId: org.id,
      },
    });
  }
  console.log('✓ Configured synthetic Threat Intelligence feed indicators');

  // 11. Lab Training Scenarios
  const labScenarios = [
    {
      scenarioKey: 'SCENARIO_BRUTE_FORCE',
      title: 'Lab A: Brute-Force Password Guessing Simulation',
      description: 'Generates 6 rapid synthetic failed authentication events against target account test.user@internal. Demonstrates SIEM thresholding and alert generation.',
      category: 'AUTH_ATTACK',
      mitreTechnique: 'T1110.001 - Brute Force: Password Guessing',
      difficulty: 'INTRODUCTORY',
      syntheticTarget: 'test.user@internal (198.51.100.42)',
      expectedOutcome: 'Rule "Multiple Consecutive Failed Authentications" fires a HIGH severity alert with attached event logs.',
      educationalSummary: 'Adversaries automate password guessing to compromise accounts. SIEM detection looks for failure volume exceeding typical human error baselines within rolling time windows.',
      parametersJson: JSON.stringify({ attempts: 6, intervalMs: 200, targetAccount: 'test.user@internal' }),
    },
    {
      scenarioKey: 'SCENARIO_PASSWORD_SPRAY',
      title: 'Lab B: Distributed Password Spraying Campaign',
      description: 'Generates single failed login attempts across 5 distinct test accounts from a single synthetic IP address to bypass single-account lockout controls.',
      category: 'AUTH_ATTACK',
      mitreTechnique: 'T1110.003 - Password Spraying',
      difficulty: 'INTERMEDIATE',
      syntheticTarget: 'Active Directory Test OU (5 accounts)',
      expectedOutcome: 'Rule "Synthetic Password Spraying Pattern" triggers CRITICAL alert grouping multiple accounts.',
      educationalSummary: 'Password spraying deliberately tests one or two common passwords against hundreds of accounts to evade per-account lockouts. SOC analysts detect this by grouping events by source IP across multiple distinct user identifiers.',
      parametersJson: JSON.stringify({ accounts: ['fin.clerk@test', 'hr.admin@test', 'sales.rep@test', 'dev.lead@test'], sourceIp: '203.0.113.19' }),
    },
    {
      scenarioKey: 'SCENARIO_PRIV_ESC',
      title: 'Lab C: Privileged Role Modification Anomaly',
      description: 'Generates a synthetic audit event representing unapproved role escalation from LAB_USER to SUPER_ADMIN.',
      category: 'PRIVILEGE_ESCALATION',
      mitreTechnique: 'T1078 - Valid Accounts: Local Accounts',
      difficulty: 'INTERMEDIATE',
      syntheticTarget: 'RBAC Authorization Engine',
      expectedOutcome: 'Rule "Unprompted Privileged IAM Elevation" produces an immediate CRITICAL alert.',
      educationalSummary: 'Once an attacker gains an initial foothold, they attempt to elevate privileges to establish persistence. Auditing role change APIs is vital for rapid containment.',
      parametersJson: JSON.stringify({ requestedRole: 'SUPER_ADMIN', bypassDualSign: true }),
    },
    {
      scenarioKey: 'SCENARIO_CHALLENGE',
      title: 'Lab D: Incident Investigation Analyst Challenge',
      description: 'Interactive challenge with a sequence of mixed background noise and hidden suspicious activity. You must identify malicious events, determine the root cause, and score your investigation accuracy.',
      category: 'INVESTIGATION_CHALLENGE',
      mitreTechnique: 'T1078 / T1110 / T1499 Multi-Stage',
      difficulty: 'ADVANCED',
      syntheticTarget: 'Multi-Asset Defense Simulation',
      expectedOutcome: 'Analyzed timeline, identified compromised account, containment action selected.',
      educationalSummary: 'Real incidents rarely happen in isolation; analysts must correlate disparate signals from proxy logs, auth records, and audit ledgers while filtering benign activity.',
      parametersJson: JSON.stringify({ totalEvents: 12, noiseEvents: 7, maliciousEvents: 5 }),
    },
  ];

  for (const scen of labScenarios) {
    await prisma.labScenario.upsert({
      where: { scenarioKey: scen.scenarioKey },
      update: {},
      create: scen,
    });
  }
  console.log(`✓ Configured ${labScenarios.length} interactive Attack Simulation Lab scenarios`);

  // 12. Audit Logs
  await prisma.auditLog.create({
    data: {
      organizationId: org.id,
      actorId: createdUsers['SUPER_ADMIN']?.id,
      action: 'SYSTEM_INITIALIZATION',
      entityType: 'PLATFORM',
      entityId: 'sentinel-x-core',
      result: 'SUCCESS',
      sourceIp: '127.0.0.1',
      safeMetadata: JSON.stringify({ version: '2026.1.0', mode: 'PRODUCTION_READY', defenseTiers: 7 }),
    },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: org.id,
      actorId: createdUsers['SOC_ANALYST']?.id,
      action: 'INCIDENT_CREATED',
      entityType: 'INCIDENT',
      entityId: incident.id,
      result: 'SUCCESS',
      sourceIp: '10.0.1.55',
      safeMetadata: JSON.stringify({ reference: 'INC-2026-0042', severity: 'HIGH' }),
    },
  });

  console.log('✓ Generated tamper-resistant audit trail entries');
  console.log('🌟 SENTINEL X database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
