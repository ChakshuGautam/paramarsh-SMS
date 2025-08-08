Feature: Exams — Results Publish
  As an Exam Controller
  I want to compute and publish results
  So that students can view their report cards

  Background:
    Given an exam term "Term 1" with components configured
    And marks are entered for all subjects

  Scenario: Compute results
    When I compute results for "Term 1"
    Then report cards should be generated in draft

  Scenario: Publish results
    Given report cards are reviewed
    When I publish results for "Term 1"
    Then students and parents can view report cards in the portal

