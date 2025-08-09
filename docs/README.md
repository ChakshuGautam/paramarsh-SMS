# Documentation Index — School Management System

This index lists all documentation included under docs/.

Core
- PRD: PRD.md
- Architecture  ERD: Architecture_and_ERD.md
- Tech Stack Overview: Tech_Stack.md
Frontend Architecture: Frontend/Architecture.md
- Frontend Experiments: Frontend/Experiments/README.md
- Backend Architecture: Backend/Architecture.md
- Testing Strategy: Testing/Strategy.md
- Data Dictionary: DataModel/Data_Dictionary.md
- Permissions  Roles: Permissions_and_Roles.md
- Localization/Compliance/Accessibility: Localization_Compliance_Accessibility.md

UX/UI
- UI/UX Specification (global components, patterns): UX_UI_Spec.md
- Screen-by-screen specs:
  - SCREENFLOWS/Admissions.md
  - SCREENFLOWS/SIS.md
  - SCREENFLOWS/Academics.md
  - SCREENFLOWS/Exams.md
  - SCREENFLOWS/Fees.md
  - SCREENFLOWS/Communication.md
  - SCREENFLOWS/Reporting.md
  - SCREENFLOWS/Transport.md
  - SCREENFLOWS/Library.md
  - SCREENFLOWS/Hostel.md

Delivery & Quality
- User Stories & Acceptance Criteria: User_Stories_and_Acceptance.md
- Test Plan: TestPlan.md

APIs
- API Endpoints Outline: API/Endpoints.md
- API Schemas: API/Schemas.md
- Error Codes & Problem Details: API/Error_Codes.md

Workflows  Reports
- Workflows: Workflows.md
- Reports  Dashboards: Reports_and_Dashboards.md

Modules (Detailed Specs)
- Modules index: Modules/README.md
- SIS: Modules/SIS.md
- Admissions: Modules/Admissions.md
- Attendance: Modules/Attendance.md
- Exams: Modules/Exams.md
- Fees: Modules/Fees.md
- Timetable: Modules/Timetable.md
- Communications: Modules/Communications.md
- Analytics: Modules/Analytics.md
- HR  Payroll: Modules/HR_Payroll.md
- Transport: Modules/Transport.md
- Library: Modules/Library.md
- Hostel: Modules/Hostel.md
- Inventory  Procurement: Modules/Inventory_Procurement.md
- Portals  Apps: Modules/Portals_Apps.md
- LMS Integrations: Modules/LMS_Integrations.md
- Superadmin/Tenant: Modules/Superadmin_Tenant.md
- Health/Counseling/Discipline: Modules/Health_Counseling_Discipline.md
- Data Governance: Modules/Data_Governance.md

Governance  Operations
- RACI: Governance/RACI.md
- Risk Register: Governance/Risk_Register.md
- Compliance: Compliance/Compliance.md
- Operations Runbooks: Operations/Runbooks.md
- Data Migrations: Operations/Migrations.md
- Project Plan: Project/Plan.md

Tenancy
- Multi-tenant Strategy: Tenancy/Strategy.md

UI
- Design System: UI/Design_System.md
- UI Flows: UI/Flows.md
- Wireframes (legacy snapshots): Wireframes/legacy/README.md

API Snapshots
- Current (3.1): API/openapi.yaml
- Legacy (0.3 from docs-cursor): API/openapi.cursor.yaml

Legacy-to-Current Mapping
- Older docs in docs-cursor/ have been imported and mapped into docs/ as follows:
  - docs-cursor/modules/* → docs/Modules/*
  - docs-cursor/ui/design-system.md → docs/UI/Design_System.md
  - docs-cursor/ui/flows.md → docs/UI/Flows.md
  - docs-cursor/ui/wireframes → docs/Wireframes/legacy
  - docs-cursor/compliance.md → docs/Compliance/Compliance.md
  - docs-cursor/operations.md → docs/Operations/Runbooks.md
  - docs-cursor/migrations.md → docs/Operations/Migrations.md
  - docs-cursor/project-plan.md → docs/Project/Plan.md
  - docs-cursor/raci.md → docs/Governance/RACI.md
  - docs-cursor/risk-register.md → docs/Governance/Risk_Register.md
  - docs-cursor/api/openapi.yaml → docs/API/openapi.cursor.yaml

