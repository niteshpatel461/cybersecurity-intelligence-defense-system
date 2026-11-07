# SentinelCore Security Hub

Modern Cybersecurity Intelligence & Threat Defense Hub with a sleek, dark cyber aesthetic and an enterprise-grade security backend.

---

## 🏗️ Architecture Overview

SentinelCore is designed as a modular, full-stack cybersecurity portal:

- **Frontend**: Vite + React 19 + TanStack Router & Query with Tailwind CSS. Real-time visual metrics, radar scanner animations, and live threat feeds.
- **Backend**: Node.js (Express) with ES Modules, protected by defense-in-depth middleware:
  - `helmet`: Hardened HTTP response headers (CSP, HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff).
  - `cors`: Strictly configured for frontend origins (`http://localhost:5173` and production URLs).
  - `express-rate-limit`: Rate limiting enforced at 30 requests/minute per IP for scanner/report endpoints.
  - `sanitize-html`: Rigorous XSS sanitization preventing malicious HTML/script injections.
  - Zero plain password logging policy.
  - Consistent JSON output: `{ success: boolean, data?: any, error?: string }`.
  - SQLite with Prisma schema ready, backed by a persistent repository with in-memory fallback.

---

## 🚀 Running Locally

### 1. Prerequisites
- **Node.js**: >= 20.0.0
- **npm**: >= 9.0.0

### 2. Backend Setup & Run (`server/`)
In a terminal, navigate to the `server/` directory:

```bash
cd server
npm install
npm run dev
```

The backend server will start on `http://localhost:5000` with hot-reloading enabled.

*(Alternatively from project root)*:
```bash
npm run dev:server
```

### 3. Frontend Setup & Run
In a separate terminal at the project root:

```bash
npm install
npm run dev
```

The frontend will open at `http://localhost:5173`. When the backend is running, the status badge in the header will glow green (`API Online`). If the backend is paused, the frontend gracefully uses local mock fallbacks (`Offline · Mock`).

---

## 🧪 Testing the Backend

SentinelCore includes an automated test suite containing 25 test cases across 6 test suites covering all required endpoints, security validations, and edge cases:

```bash
# From server directory
cd server
npm test

# Or from project root
npm run test:server
```

---

## 📡 Backend API Reference & Testing with curl

### 1. Health Check
Returns system status, current timestamp, and server uptime.
```bash
curl -X GET http://localhost:5000/api/health
```

**Response (200 OK)**:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-11-07T06:22:24.344Z",
  "uptime": 45,
  "data": {
    "status": "healthy",
    "timestamp": "2026-11-07T06:22:24.344Z",
    "uptime": 45,
    "service": "SentinelCore Security Hub API",
    "version": "1.0.0",
    "environment": "development"
  }
}
```

---

### 2. Curated Security Advisories
Fetches recent CVEs and threat bulletins (supports query filters `severity`, `category`, `search`, `limit`).
```bash
curl -X GET "http://localhost:5000/api/advisories?severity=critical&limit=2"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "adv-2026-001",
      "cve": "CVE-2026-31337",
      "title": "Remote Code Execution in Enterprise Edge Gateway",
      "severity": "critical",
      "category": "Remote Code Execution",
      "summary": "Unauthenticated remote code execution via crafted HTTP/2 rapid reset and header frames.",
      "date": "2026-11-05",
      "published": "2026-11-05",
      "cvssScore": 9.8
    }
  ]
}
```

---

### 3. Password Strength & Entropy Auditor
Audits password length, Shannon entropy, character diversity, dictionary words, and common sequences.
> **Security Rule**: The plain password is never logged or saved anywhere.

```bash
curl -X POST http://localhost:5000/api/check-password \
  -H "Content-Type: application/json" \
  -d '{"password": "X9#mK2$vL8!qP4@z"}'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "score": 100,
  "strength": "strong",
  "entropy": 105,
  "suggestions": [
    "Excellent password strength! Store it in an encrypted password manager and enforce MFA."
  ],
  "recommendations": [
    "Excellent password strength! Store it in an encrypted password manager and enforce MFA."
  ],
  "characterMix": {
    "length": 16,
    "hasUppercase": true,
    "hasLowercase": true,
    "hasNumbers": true,
    "hasSymbols": true
  },
  "commonDictionaryWordDetected": false
}
```

---

### 4. Domain & URL Quick Scanner
Analyzes URLs against heuristic threat indicators (suspicious TLDs, IP literal hosts, excessive subdomains, homoglyphs / Punycode).

```bash
curl -X POST http://localhost:5000/api/scan-url \
  -H "Content-Type: application/json" \
  -d '{"targetUrl": "http://45.33.32.156/secure-login.xyz"}'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "targetUrl": "http://45.33.32.156/secure-login.xyz",
  "target": "http://45.33.32.156/secure-login.xyz",
  "riskScore": 75,
  "status": "Malicious",
  "detectedFlags": [
    "IP Literal Host: 45.33.32.156",
    "Phishing Keywords: [login]",
    "Unencrypted HTTP Protocol"
  ],
  "flags": [
    {
      "label": "Raw IP host",
      "level": "high",
      "detail": "Target host (45.33.32.156) is a raw IP literal."
    },
    {
      "label": "Phishing keywords",
      "level": "high",
      "detail": "URL contains high-risk phishing keywords [login]."
    },
    {
      "label": "No HTTPS",
      "level": "medium",
      "detail": "Target is served over unencrypted HTTP."
    }
  ]
}
```

---

### 5. Security Incident Reporting
Validates incident report submissions, sanitizes against XSS attacks, generates a tracking ticket ID, and persists the record.

```bash
curl -X POST http://localhost:5000/api/report \
  -H "Content-Type: application/json" \
  -d '{
    "reporterEmail": "soc-team@enterprise.corp",
    "incidentType": "Phishing",
    "description": "Observed corporate credentials targeted by active QR-code phishing kit.",
    "severity": "high"
  }'
```

**Response (201 Created)**:
```json
{
  "success": true,
  "ticketId": "SC-2026-998426",
  "message": "Security incident reported successfully. Triage response team notified.",
  "data": {
    "id": "daf97917-f7c2-4fef-b79c-de66bf4ca226",
    "ticketId": "SC-2026-998426",
    "reporterEmail": "soc-team@enterprise.corp",
    "incidentType": "Phishing",
    "severity": "high",
    "description": "Observed corporate credentials targeted by active QR-code phishing kit.",
    "status": "Triage_Queued",
    "createdAt": "2026-11-07T06:22:24.405Z"
  }
}
```

---

## 🔒 Security Middleware & Policies

| Policy | Implementation | Description |
|---|---|---|
| **Rate Limiting** | `express-rate-limit` | 30 requests/minute per IP on `/api/check-password`, `/api/scan-url`, `/api/report`. Returns standard `RateLimit-*` headers. |
| **HTTP Security Headers** | `helmet` | Configures CSP, HSTS (in production), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`. |
| **CORS Policy** | `cors` | Restricts access to `http://localhost:5173` and allowed origins via `CORS_ORIGIN` env var. |
| **Input Sanitization** | `sanitize-html` | Neutralizes XSS vectors (`<script>`, `<iframe>`, `javascript:`, event handlers) before persistence. |
| **Zero Password Logging** | Custom `requestLogger` | Redacts sensitive fields (`password`, `token`, `secret`, `authorization`) from all system logs. |
| **DoS Guardrail** | `express.json({ limit: "100kb" })` | Rejects payload flooding exceeding 100kb with HTTP 413. |

---

## 🐳 Deployment Configurations

### 1. Docker
Build and run with a minimal, non-root Alpine container:
```bash
docker build -t sentinelcore-backend -f Dockerfile .
docker run -p 5000:5000 --env-file server/.env sentinelcore-backend
```

### 2. Render (`render.yaml`)
A complete `render.yaml` specification is provided for 1-click or automated Git deployments on [Render](https://render.com). Includes automatic health checks at `/api/health`.

### 3. Railway (`railway.json`)
A `railway.json` configuration is provided for deployments on [Railway](https://railway.app) with Dockerfile detection, automatic restart policies, and healthcheck timeouts.

---

## 💻 Tech Stack Summary
- **Backend Runtime**: Node.js 20+ (ES Modules)
- **Framework**: Express 4.x
- **Database**: SQLite with Prisma schema ready + persistent file/in-memory repository
- **Frontend**: Vite + React 19 + TanStack Start / Router + Tailwind CSS
- **Testing**: Node.js native test runner (`node:test`) + `supertest`
