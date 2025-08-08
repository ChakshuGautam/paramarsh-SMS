# Acceptance Tests — SIS

```gherkin
Feature: Student management
  Scenario: Unique roll number per section
    Given a section 8A with existing roll numbers
    When I assign a roll number that already exists
    Then the system rejects with a validation error

Feature: Bulk promote
  Scenario: Promotion dry-run
    Given a grade with 120 students
    When I run promotion in dry-run mode
    Then a report lists target sections and conflicts without committing changes
```
