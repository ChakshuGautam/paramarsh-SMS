# Project Progress Tracking

This folder contains a lightweight, code-aware progress tracker that summarizes what is documented in `docs/` and what is implemented in `apps/` and `services/`.

Outputs

- `status.json`: machine-readable progress snapshot per area/module
- `STATUS.md`: human-readable table with percentages and gaps

Usage

```bash
node progress/generate.mjs
```

Notes

- Heuristics map high-level modules to backend (`apps/api/src/modules/*`) and admin resources (`apps/web/app/admin/resources/*`).
- OpenAPI presence is detected via `docs/API/openapi.yaml` mentions.
- Mock API presence is detected via `services/mock-api`.


