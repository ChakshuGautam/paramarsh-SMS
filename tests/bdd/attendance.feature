Feature: Attendance — Daily Marking
  As a Class Teacher
  I want to mark daily attendance
  So that the school records are up to date

  Background:
    Given a class "Class 6 A" with enrolled students

  Scenario: Mark all present
    When I open the daily attendance screen for "Class 6 A" on "2025-08-08"
    And I mark all present
    Then all students should have status "present"

  Scenario: Notify absent guardians
    Given I mark student "Aarav Sharma" as "absent"
    When I submit attendance
    Then the guardian should receive an absence notification

