# Operations & SRE — Paramarsh SMS

- SLOs: availability 99.9%; latency P95 < 300ms reads, < 800ms writes
- On-call: 24x5 coverage during school days; incident severity matrix
- Monitoring: API metrics, DB health, queues, error budgets
- Backups: daily full, PITR; quarterly restore drills
- DR: RPO 15m, RTO 2h; region failover runbook
- Runbooks: payments webhook replay, scheduling stuck jobs, comms provider failover
