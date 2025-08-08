# Acceptance Tests — Fees & Payments

```gherkin
Feature: Invoice generation
  Scenario: Bulk invoice run is idempotent
    Given a fee structure configured for Grade 8
    When invoices are generated twice for April
    Then duplicate invoices are not created

Feature: Payment processing
  Scenario: Successful payment updates status
    Given an unpaid invoice
    When the parent pays via gateway
    And a signed webhook is received
    Then the invoice status becomes Paid within 2 minutes
    And a receipt is sent

Feature: Dunning
  Scenario: Reminder suppression after payment
    Given a scheduled reminder for tomorrow
    When the invoice is paid today
    Then the reminder is canceled
```
