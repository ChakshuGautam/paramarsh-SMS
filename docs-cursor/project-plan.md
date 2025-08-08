# Project Plan — Paramarsh SMS

## Delivery Milestones
- M0: Foundations (Auth/SSO, Tenanting, Design System, CI/CD)
- M1: Core SIS + Attendance + Communications
- M2: Exams/Report Cards + Fees/Payments
- M3: Timetable + HR/Payroll
- M4: Transport + Library
- M5: Admissions + Analytics v1
- M6: Hostel + Inventory + Advanced Analytics

## High-Level Gantt
```mermaid
gantt
  title Paramarsh SMS Delivery Roadmap
  dateFormat  YYYY-MM-DD
  section Foundations
  Auth/SSO & Tenanting        :done,    m0a, 2025-01-01, 2025-01-21
  Design System & UX Patterns  :active,  m0b, 2025-01-08, 2025-02-05
  CI/CD & Environments         :         m0c, 2025-01-10, 2025-02-10
  section M1
  SIS                          :         m1a, 2025-02-01, 2025-03-15
  Attendance                   :         m1b, 2025-02-15, 2025-03-20
  Comms                        :         m1c, 2025-02-15, 2025-03-10
  section M2
  Exams & Report Cards         :         m2a, 2025-03-01, 2025-04-15
  Fees & Payments              :         m2b, 2025-03-10, 2025-04-25
  section M3
  Timetable                    :         m3a, 2025-04-15, 2025-05-20
  HR/Payroll                   :         m3b, 2025-04-20, 2025-06-05
  section M4
  Transport                    :         m4a, 2025-05-15, 2025-06-15
  Library                      :         m4b, 2025-05-22, 2025-06-20
  section M5
  Admissions                   :         m5a, 2025-06-01, 2025-07-10
  Analytics v1                 :         m5b, 2025-06-10, 2025-07-25
  section M6
  Hostel & Inventory           :         m6a, 2025-07-01, 2025-08-15
  Advanced Analytics           :         m6b, 2025-07-15, 2025-08-30
```

## Team & RACI
- Product: requirements, prioritization, acceptance
- Engineering: architecture, implementation, quality
- Design: UX, UI system, usability
- QA: test strategy, automation, UAT
- DevOps: CI/CD, infra, SRE

## Risks & Mitigations
- Scheduling complexity → fallback manual override, phase constraints
- Payment reliability → retries, dual gateway, reconciliation
- Data migration → pilot, scripts, verification checklist
