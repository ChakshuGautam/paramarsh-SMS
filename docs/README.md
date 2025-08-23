# Paramarsh SMS Documentation

## 📚 Documentation Structure

This documentation is organized into two main categories:

### 1. **Global Documentation** (Horizontal - Across All Modules)
Core documentation that applies to the entire system and all modules.

### 2. **Module Documentation** (Vertical - Module-Specific)
Detailed implementation guides for each individual module.

---

## 🌍 Global Documentation (Start Here)

### Foundation Layer
1. **[00-GETTING-STARTED.md](global/00-GETTING-STARTED.md)** - Quick start guide
2. **[01-ARCHITECTURE.md](global/01-ARCHITECTURE.md)** - System architecture & design patterns
3. **[02-TECH-STACK.md](global/02-TECH-STACK.md)** - Technology decisions & stack
4. **[03-PROJECT-STRUCTURE.md](global/03-PROJECT-STRUCTURE.md)** - Monorepo organization

### API & Data Layer
5. **[04-API-CONVENTIONS.md](global/04-API-CONVENTIONS.md)** - REST API standards & React Admin spec
6. **[05-DATABASE-DESIGN.md](global/05-DATABASE-DESIGN.md)** - Schema patterns & multi-tenancy
7. **[06-DATA-MODELS.md](global/06-DATA-MODELS.md)** - Entity relationships & ERD

### Implementation Standards
8. **[07-CODING-STANDARDS.md](global/07-CODING-STANDARDS.md)** - Code style & best practices
9. **[08-TESTING-STRATEGY.md](global/08-TESTING-STRATEGY.md)** - Test patterns & coverage requirements
10. **[09-UI-GUIDELINES.md](global/09-UI-GUIDELINES.md)** - Frontend patterns & shadcn/ui usage

### Operations & Deployment
11. **[10-SECURITY.md](global/10-SECURITY.md)** - Security patterns & RBAC
12. **[11-DEPLOYMENT.md](global/11-DEPLOYMENT.md)** - Deployment & environment setup
13. **[12-MONITORING.md](global/12-MONITORING.md)** - Logging & observability

### Regional & Compliance
14. **[13-INDIAN-CONTEXT.md](global/13-INDIAN-CONTEXT.md)** - CBSE compliance & Indian education system
15. **[14-LOCALIZATION.md](global/14-LOCALIZATION.md)** - Multi-language & regional settings

---

## 📦 Module Documentation

Each module follows this standard structure:
- **Overview** - Module purpose & scope
- **Data Models** - Entities & relationships
- **API Endpoints** - Complete API specification
- **Business Logic** - Core functionality & rules
- **Frontend Components** - UI implementation
- **Test Coverage** - Testing requirements
- **Seed Data** - Demo data requirements

### Core Modules

#### Student Information System
- **[students/](modules/students/)** - Student management
- **[guardians/](modules/guardians/)** - Parent/guardian management
- **[enrollments/](modules/enrollments/)** - Student enrollment & registration
- **[classes/](modules/classes/)** - Class & section management

#### Academic Management
- **[teachers/](modules/teachers/)** - Teacher management
- **[subjects/](modules/subjects/)** - Subject & curriculum
- **[timetable/](modules/timetable/)** - Schedule management
- **[academic-years/](modules/academic-years/)** - Academic calendar

#### Assessment & Evaluation
- **[exams/](modules/exams/)** - Examination management
- **[marks/](modules/marks/)** - Marks & grading
- **[attendance/](modules/attendance/)** - Attendance tracking

#### Financial Management
- **[fees/](modules/fees/)** - Fee structures & schedules
- **[invoices/](modules/invoices/)** - Invoice generation
- **[payments/](modules/payments/)** - Payment processing

#### Human Resources
- **[staff/](modules/staff/)** - Staff management
- **[payroll/](modules/payroll/)** - Salary & payroll

#### Communication
- **[communications/](modules/communications/)** - Messaging & notifications
- **[templates/](modules/templates/)** - Message templates
- **[campaigns/](modules/campaigns/)** - Bulk communications
- **[tickets/](modules/tickets/)** - Support tickets

#### Additional Modules
- **[admissions/](modules/admissions/)** - Admission process
- **[transport/](modules/transport/)** - Transport management
- **[library/](modules/library/)** - Library management
- **[hostel/](modules/hostel/)** - Hostel management
- **[health/](modules/health/)** - Health records
- **[discipline/](modules/discipline/)** - Disciplinary records
- **[events/](modules/events/)** - Event management
- **[reports/](modules/reports/)** - Reporting & analytics

---

## 🚀 Quick Navigation

### For Developers
1. Start with **[00-GETTING-STARTED.md](global/00-GETTING-STARTED.md)**
2. Review **[04-API-CONVENTIONS.md](global/04-API-CONVENTIONS.md)**
3. Check module-specific guide in **[modules/](modules/)**

### For Implementers
1. Review **[01-ARCHITECTURE.md](global/01-ARCHITECTURE.md)**
2. Understand **[05-DATABASE-DESIGN.md](global/05-DATABASE-DESIGN.md)**
3. Follow **[07-CODING-STANDARDS.md](global/07-CODING-STANDARDS.md)**

### For Testers
1. Read **[08-TESTING-STRATEGY.md](global/08-TESTING-STRATEGY.md)**
2. Check module test requirements in respective module docs

### For DevOps
1. Review **[11-DEPLOYMENT.md](global/11-DEPLOYMENT.md)**
2. Setup **[12-MONITORING.md](global/12-MONITORING.md)**
3. Implement **[10-SECURITY.md](global/10-SECURITY.md)**

---

## 📋 Implementation Checklist

When implementing a new module, ensure you have:

- [ ] Read global documentation (especially API conventions)
- [ ] Reviewed module-specific documentation
- [ ] Created backend service extending BaseCrudService
- [ ] Implemented all 6 REST endpoints
- [ ] Added multi-tenancy support (X-Branch-Id)
- [ ] Created frontend components (List, Create, Edit)
- [ ] Used only shadcn/ui components (no MUI!)
- [ ] Written E2E tests
- [ ] Added seed data
- [ ] Updated documentation

---

## 🔍 Search Documentation

Looking for something specific?

- **API Specs**: See [global/04-API-CONVENTIONS.md](global/04-API-CONVENTIONS.md)
- **Database Schema**: See [global/05-DATABASE-DESIGN.md](global/05-DATABASE-DESIGN.md)
- **Module Details**: See [modules/](modules/) directory
- **Indian Context**: See [global/13-INDIAN-CONTEXT.md](global/13-INDIAN-CONTEXT.md)
- **Testing**: See [global/08-TESTING-STRATEGY.md](global/08-TESTING-STRATEGY.md)

---

## 📁 Legacy Documentation

Previous documentation structure is preserved in:
- **API**: [API/](API/) - OpenAPI specs and schemas
- **Modules**: [Modules/](Modules/) - Original module documentation
- **SCREENFLOWS**: [SCREENFLOWS/](SCREENFLOWS/) - UI flow documentation
- **Wireframes**: [Wireframes/](Wireframes/) - UI mockups

---

## 🔄 Migration from Old Structure

We are transitioning to a cleaner structure:
- Old: Scattered documentation across multiple directories
- New: Organized into `global/` (horizontal) and `modules/` (vertical)
- Status: In progress - both structures currently coexist