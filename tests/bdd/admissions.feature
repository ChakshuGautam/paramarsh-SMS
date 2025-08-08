Feature: Admissions — Offer and Enrolment
  As an Admin
  I want to review applications and issue offers
  So that successful candidates can enrol

  Background:
    Given an admissions form is published
    And an application "APP-1001" exists with required documents

  Scenario: Issue an offer after interview
    When I record an interview score of 78 for application "APP-1001"
    And I issue an offer with fee summary
    Then the applicant should receive an offer notification
    And the application status should be "Offered"

  Scenario: Accept offer and enrol
    Given an offer exists for application "APP-1001"
    When the parent accepts the offer and pays the admission fee
    Then a student record should be created
    And the student should be assigned to a class and section

