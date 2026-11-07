# SentinelCore Security Hub - Backend API

Production-ready backend API service for **SentinelCore Cybersecurity Intelligence & Tools Web App**, engineered with defense-in-depth principles.

---

## 🛠️ Tech Stack & Security Middleware

- **Runtime**: Node.js 20+ with native ES Modules (`"type": "module"`)
- **Framework**: Express 4.x
- **Security Middlewares**:
  - `helmet`: Hardened HTTP response headers (CSP, HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff)
  - `cors`: Configured origin allowing `http://localhost:5173` and customizable via environment variables
  - `express-rate-limit`: Per-IP rate limiting (maximum 30 requests/minute on scanner endpoints; 120 req/min for general endpoints)
  - `sanitize-html`: Strict XSS input sanitization stripping malicious script/HTML injection
  - `requestLogger`: Security-conscious logging with **zero plain password logging** (sensitive keys redacted)
- **Database**:
  - SQLite with Prisma schema ready (`prisma/schema.prisma`)
  - File-backed persistent storage (`data/sentinelcore-data.json`) with automatic in-memory mock fallback

---

## 🚀 Quickstart & Local Development

### 1. Prerequisites
- Node.js >= 20.0.0
- npm >= 9.0.0

### 2. Installation
Navigate into the `server` directory and install dependencies:
```bash
cd server
npm install
```

### 3. Environment Variables
Create your local environment file:
```bash
cp .env.example .env
```

Default `.env` configuration:
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_SCANNER_MAX=30
RATE_LIMIT_SCANNER_WINDOW_MS=60000
RATE_LIMIT_GENERAL_MAX=120
RATE_LIMIT_GENERAL_WINDOW_MS=60000
DATABASE_URL="file:./data/sentinelcore.db"
```

### 4. Running the Server

#### Development Mode (with hot-reloading)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will listen at:
```
http://localhost:5000
```

---

## 🧪 Automated Testing

SentinelCore includes a comprehensive test suite (25 test cases across 6 suites) using Node.js's native test runner (`node:test`) and `supertest`:

```bash
npm test
```

Test coverage includes:
- `health.test.js`: Health verification, uptime, standard JSON envelopes, and 404 handler
- `advisories.test.js`: Curated CVE threat feeds, filtering by severity and limit, single advisory lookup
- `password.test.js`: Shannon entropy calculation, dictionary word presence, repetition checks, zero password reflection
- `scanUrl.test.js`: Raw IP host detection, suspicious TLDs, Punycode/homoglyph spoofing, URL validation
- `report.test.js`: Incident report triage, ticket ID formatting (`SC-YYYY-XXXXXX`), and XSS payload sanitization
- `rateLimit.test.js`: Verification of standard rate limit headers

---

## 📡 API Reference & Testing with curl

All API responses strictly adhere to a consistent JSON format:
```json
{
  "success": boolean,
  "data"?: any,
  "error"?: string
}
```

### 1. Health Check
Checks backend operational status, uptime, and system health.

- **Method / Endpoint**: `GET /api/health`
- **Rate Limit**: General (120 req/min)

#### Example Request:
```bash
curl -X GET http://localhost:5000/api/health
```

#### Example Response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-11-07T06:22:24.344Z",
  "uptime": 142,
  "data": {
    "status": "healthy",
    "timestamp": "2026-11-07T06:22:24.344Z",
    "uptime": 142,
    "service": "SentinelCore Security Hub API",
    "version": "1.0.0",
    "environment": "development"
  }
}
```

---

### 2. Curated Security Advisories
Fetches curated CVE threat bulletins and vulnerability intelligence. Supports query parameters `severity`, `category`, `search`, and `limit`.

- **Method / Endpoint**: `GET /api/advisories`
- **Query Parameters**:
  - `severity` *(optional)*: `critical` | `high` | `medium` | `low`
  - `category` *(optional)*: filter by threat category
  - `limit` *(optional)*: number of records to return
- **Rate Limit**: General (120 req/min)

#### Example Request:
```bash
curl -X GET "http://localhost:5000/api/advisories?severity=critical&limit=1"
```

#### Example Response:
```json
{
  "success": true,
  "count": 1,
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
      "affectedSystems": ["EdgeGateway OS < 9.4.2"],
      "cvssScore": 9.8
    }
  ]
}
```

---

### 3. Password Strength & Entropy Auditor
Audits password entropy, character diversity, dictionary word presence, and repetitive patterns.

> **Security Rule**: The plain password is never logged, printed, or saved anywhere.

- **Method / Endpoint**: `POST /api/check-password`
- **Rate Limit**: Scanner Tier (30 req/min)
- **Headers**: `Content-Type: application/json`

#### Example Request:
```bash
curl -X POST http://localhost:5000/api/check-password \
  -H "Content-Type: application/json" \
  -d '{"password": "password123"}'
```

#### Example Response:
```json
{
  "success": true,
  "score": 10,
  "strength": "weak",
  "entropy": 38,
  "suggestions": [
    "Use at least 12 characters (16+ recommended for strong defense).",
    "Add uppercase letters (A-Z) to increase character space.",
    "Include special symbols like !@#$%^&* to resist brute-force cracking.",
    "Avoid common dictionary words, brand names, or predictable substitutions.",
    "Avoid predictable keyboard sequences or ascending numbers (e.g. '1234', 'qwerty')."
  ],
  "recommendations": [
    "Use at least 12 characters (16+ recommended for strong defense).",
    "Add uppercase letters (A-Z) to increase character space.",
    "Include special symbols like !@#$%^&* to resist brute-force cracking.",
    "Avoid common dictionary words, brand names, or predictable substitutions.",
    "Avoid predictable keyboard sequences or ascending numbers (e.g. '1234', 'qwerty')."
  ],
  "characterMix": {
    "length": 11,
    "hasUppercase": false,
    "hasLowercase": true,
    "hasNumbers": true,
    "hasSymbols": false
  },
  "commonDictionaryWordDetected": true
}
```

---

### 4. Domain & URL Threat Scanner
Evaluates URLs and hostnames against heuristic threat indicators (suspicious TLDs, IP literal hosts, excessive subdomains, and homoglyphs / IDN Punycode spoofing).

- **Method / Endpoint**: `POST /api/scan-url`
- **Rate Limit**: Scanner Tier (30 req/min)
- **Headers**: `Content-Type: application/json`

#### Example Request:
```bash
curl -X POST http://localhost:5000/api/scan-url \
  -H "Content-Type: application/json" \
  -d '{"targetUrl": "http://45.33.32.156/secure-login.xyz"}'
```

#### Example Response:
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
      "detail": "Target host (45.33.32.156) is a raw IP literal. Malware campaigns and C2 servers frequently use IP addresses to bypass domain reputation checks."
    },
    {
      "label": "Phishing keywords",
      "level": "high",
      "detail": "URL contains high-risk phishing keywords [login] typically associated with credential harvesting pages."
    },
    {
      "label": "No HTTPS",
      "level": "medium",
      "detail": "Target is served over unencrypted HTTP. Credentials and traffic are vulnerable to eavesdropping and interception."
    }
  ]
}
```

---

### 5. Security Incident Reporting
Submits a security incident report. Input is validated, sanitized against XSS injection, assigned a unique tracking ticket ID, and persisted.

- **Method / Endpoint**: `POST /api/report`
- **Rate Limit**: Scanner Tier (30 req/min)
- **Headers**: `Content-Type: application/json`

#### Example Request:
```bash
curl -X POST http://localhost:5000/api/report \
  -H "Content-Type: application/json" \
  -d '{
    "reporterEmail": "analyst@enterprise.corp",
    "incidentType": "Phishing",
    "description": "Observed sophisticated credential harvesting page mimicking corporate SSO portal.",
    "severity": "high"
  }'
```

#### Example Response (HTTP 201 Created):
```json
{
  "success": true,
  "ticketId": "SC-2026-8B1E90",
  "message": "Security incident reported successfully. Triage response team notified.",
  "data": {
    "id": "787c881c-43df-47eb-ba68-d0696f86ca22",
    "ticketId": "SC-2026-8B1E90",
    "reporterEmail": "analyst@enterprise.corp",
    "incidentType": "Phishing",
    "severity": "high",
    "description": "Observed sophisticated credential harvesting page mimicking corporate SSO portal.",
    "status": "Triage_Queued",
    "createdAt": "2026-11-07T06:22:24.405Z"
  }
}
```

---

## 🔒 Security Hardening Details

1. **Helmet HTTP Headers**:
   - `Content-Security-Policy`: Restricts scripts, styles, and network connections.
   - `X-Frame-Options: DENY`: Defends against clickjacking.
   - `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing exploits.
   - `Referrer-Policy: strict-origin-when-cross-origin`: Minimizes referrer leakage.
2. **Rate Limiting**:
   - Scanner tier (`/api/check-password`, `/api/scan-url`, `/api/report`) limited to 30 requests per minute per IP.
   - Returns standard RFC draft-7 headers (`RateLimit-Limit`, `RateLimit-Remaining`).
3. **Zero Plain Password Logging**:
   - `requestLogger` intercepts and redacts all instances of `password`, `token`, `secret`, and `authorization` keys.
4. **XSS Protection**:
   - `sanitize-html` removes dangerous HTML tags (`<script>`, `<iframe>`, `javascript:`, event handlers) before storing reports.
5. **Payload Size Guardrails**:
   - Body parsers capped at `100kb` to thwart memory-exhaustion Denial-of-Service attacks.

---

## 🐳 Deployment Configurations

### Docker
Build and run the production image as a hardened, non-root container:
```bash
docker build -t sentinelcore-backend -f Dockerfile .
docker run -p 5000:5000 --env-file .env sentinelcore-backend
```

### Render (`render.yaml`)
A `render.yaml` blueprint is included in the project root:
- Automatic health check at `/api/health`
- Environment variables pre-configured

### Railway (`railway.json`)
A `railway.json` configuration is included with automatic restarts and Dockerfile detection.

