# Acceptance Tests — Exams & Report Cards

```gherkin
Feature: Report card generation
  Scenario: Generate branded PDFs
    Given a published grade scale and template
    When I generate report cards for Term 1
    Then PDFs include school branding, grades, comments, and signatures

Feature: Moderation and recompute
  Scenario: Adjust marks and recompute
    Given marks are entered for Math
    When moderation of +5% is applied
    Then grades recompute and audit log records the change

Feature: Publish and lock
  Scenario: Locked after publish
    Given report cards are published
    When a teacher attempts to edit marks
    Then the system blocks the change and prompts for re-open with audit
```
