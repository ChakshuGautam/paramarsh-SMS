# Wireframe — Inventory & Procurement
```mermaid
flowchart TD
  A[Items] --> B[PR]
  B --> C[PO]
  C --> D[GRN]
  A --> E[Stock]
```
Low-fi:
```
+-------------------------------+
| Inventory                     |
+-------------------------------+
| Items [Add]                   |
| PR ▸  PO ▸  GRN ▸             |
| Stock Ledger                  |
+-------------------------------+
```
