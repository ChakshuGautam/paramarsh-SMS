# Acceptance Tests — Attendance

```gherkin
Feature: Teacher period-wise attendance
  Scenario: Mark all present quickly
    Given I am a Teacher on the Today's Classes screen
    When I open a class with 40 students and tap All Present
    And I toggle 2 students to Absent with reasons
    And I tap Save
    Then the attendance is saved within 60 seconds (P95)
    And an audit log is created

  Scenario: Offline marking with later sync
    Given I am offline
    When I mark attendance for a class
    Then it is stored locally
    And it syncs successfully when online with conflict resolution

Feature: Attendance alerts
  Scenario: Notify parent on absence
    Given alert policy is enabled
    When a student is marked Absent
    Then a notification is sent respecting quiet hours
```
