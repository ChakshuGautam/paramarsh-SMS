# Acceptance Tests — Admissions

```gherkin
Feature: Applications and offers
  Scenario: Offer expiry and auto-promotion
    Given a waitlist ordered by priority rules
    And an offer expiring today at 23:59
    When the offer expires
    Then the next candidate is auto-promoted and notified

Feature: Duplicate detection
  Scenario: Flag potential duplicates
    Given an application is submitted
    When the system detects a match on name, DOB, guardian phone
    Then admissions officer sees a duplicate warning
```
