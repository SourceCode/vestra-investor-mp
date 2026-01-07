# Phase 37: Security Audits & Hardening

## Objective
Harden the application security before production.

## Dependencies
- All previous phases

## Tasks
1.  **Security Headers**
    - Configure `helmet` in Express.
    - CSP (Content Security Policy).

2.  **Rate Limiting**
    - Implement `express-rate-limit` on Auth and API routes.

3.  **Dependency Audit**
    - Run `npm audit`. Fix critical vulnerabilities.

4.  **Penetration Testing (Self)**
    - Try to access Tenant B data as Tenant A user.
    - SQL Injection checks (though TypeORM helps).
    - XSS checks (React helps).

## Technical Considerations
- **Secrets**: Rotate API keys. Ensure `.env` is not committed.

## Verification
- Scan results are clean.
- Rate limiter blocks spam requests.
- Cross-tenant access fails.
