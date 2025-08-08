# Data Migration Plan — Paramarsh SMS

- Discovery: source systems, data contracts, exports (SIS, fees, HR)
- Mapping: field mapping to Paramarsh schemas; transformations; reference data
- Tooling: CSV + scripted loaders; validation reports; idempotency
- Dry runs: sandbox import, QA validation, sign-off
- Cutover: freeze window, delta import, verification, rollback plan
