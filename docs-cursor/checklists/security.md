# Security Checklist
- [ ] RBAC/ABAC policies implemented per module
- [ ] TLS everywhere; HSTS enabled
- [ ] Secrets in vault; rotation policy
- [ ] JWT exp ≤ 15m; refresh tokens secure
- [ ] Webhook signature verification
- [ ] SQL injection/XSS protections; input validation
- [ ] Audit logs for admin/finance actions
- [ ] Backups encrypted; restore drill passed
