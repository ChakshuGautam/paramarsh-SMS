Feature: Fees — Invoice and Online Payment
  As a Finance User
  I want to issue invoices and collect payments online
  So that collections are streamlined

  Background:
    Given fee heads and structures are configured
    And a student "Aarav Sharma" exists with admission no "S-001"

  Scenario: Issue invoice
    When I generate a monthly tuition invoice for "S-001"
    Then an invoice should be created with status "issued"

  Scenario: Online payment via Razorpay
    Given an invoice exists for "S-001"
    When the parent pays the invoice via UPI
    Then the invoice should be marked as "paid" after webhook capture

