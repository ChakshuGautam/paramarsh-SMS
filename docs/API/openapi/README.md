# Modular OpenAPI (paths-only)

- This folder contains per-resource path files under `paths/`.
- Components (parameters/responses/schemas) are defined in `docs/API/openapi.yaml` and `docs/API/fragments/common.yaml`.
- To bundle into a single spec later, use a tool like Redocly or swagger-cli to merge root components with these path fragments.
