"use client";

import { useEffect, useState } from "react";
import { Admin } from "@/components/admin";
import { type DataProvider as RADataProvider } from "ra-core";
import { Resource } from "react-admin";
import { dataProvider } from "./DataProvider";
import authProvider from "./authProvider";
import { Dashboard } from "./Dashboard";
// import { PermissionAwareResource } from "./components/PermissionAwareResource"; // Disabled for development
import { RoleSwitcher } from "./components/RoleSwitcher";
import * as Students from "./resources/students";
import * as Guardians from "./resources/guardians";
import * as AdmissionsApplications from "./resources/admissionsApplications";
import * as Exams from "./resources/exams";
import * as AcademicYears from "./resources/academicYears";
import * as FeeStructures from "./resources/feeStructures";
import * as Invoices from "./resources/invoices";
import * as Payments from "./resources/payments";
import * as Classes from "./resources/classes";
import * as Sections from "./resources/sections";
import * as Enrollments from "./resources/enrollments";
import * as Marks from "./resources/marks";
// import * as AttendanceRecords from "./resources/attendanceRecords"; // Removed due to API issues
import * as AttendanceSessions from "./resources/attendanceSessions";
import * as TeacherAttendance from "./resources/teacherAttendance";
import * as Staff from "./resources/staff";
import * as Teachers from "./resources/teachers";
import * as Templates from "./resources/templates";
import * as Campaigns from "./resources/campaigns";
import * as Messages from "./resources/messages";
import * as Tickets from "./resources/tickets";
import * as Subjects from "./resources/subjects";
import * as Rooms from "./resources/rooms";
import * as Timetable from "./resources/timetable";
import * as TimetableGrid from "./resources/timetableGrid";
import * as TimeSlots from "./resources/timeSlots";
import * as Substitutions from "./resources/substitutions";
import * as FeeSchedules from "./resources/feeSchedules";
import * as Preferences from "./resources/preferences";
import * as Tenants from "./resources/tenants";
import * as SectionTimetables from "./resources/sectionTimetables";
import * as Timetables from "./resources/timetables";

const raDataProvider = dataProvider as unknown as RADataProvider;

const AdminApp = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <Admin dataProvider={raDataProvider} authProvider={authProvider} dashboard={Dashboard}>
    {/* Core Academic Structure */}
    <Resource
      name="students"
      list={Students.List}
      show={Students.Show}
      edit={Students.Edit}
      create={Students.Create}
    />
    <Resource
      name="guardians"
      list={Guardians.List}
      show={Guardians.Show}
      edit={Guardians.Edit}
      create={Guardians.Create}
    />
    <Resource
      name="classes"
      list={Classes.List}
      show={Classes.Show}
      edit={Classes.Edit}
      create={Classes.Create}
    />
    <Resource
      name="sections"
      list={Sections.List}
      show={Sections.Show}
      edit={Sections.Edit}
      create={Sections.Create}
    />
    <Resource
      name="enrollments"
      list={Enrollments.List}
      show={Enrollments.Show}
      edit={Enrollments.Edit}
      create={Enrollments.Create}
    />
    
    {/* Daily Academic Operations */}
    <Resource
      name="attendanceSessions"
      options={{ label: "Daily Attendance" }}
      list={AttendanceSessions.List}
      edit={AttendanceSessions.Edit}
      show={AttendanceSessions.Show}
    />
    <Resource
      name="substitutions"
      options={{ label: "Substitutions" }}
      list={Substitutions.List}
      show={Substitutions.Show}
      edit={Substitutions.Edit}
      create={Substitutions.Create}
    />
    <Resource
      name="teacherAttendance"
      options={{ label: "Teacher Attendance" }}
      list={TeacherAttendance.List}
    />
    
    {/* Admissions */}
    <Resource
      name="admissionsApplications"
      options={{ label: "Applications" }}
      list={AdmissionsApplications.List}
      show={AdmissionsApplications.Show}
      edit={AdmissionsApplications.Edit}
      create={AdmissionsApplications.Create}
    />
    
    {/* Academic Assessment */}
    <Resource
      name="exams"
      list={Exams.List}
      show={Exams.Show}
      edit={Exams.Edit}
      create={Exams.Create}
    />
    <Resource
      name="marks"
      list={Marks.List}
      show={Marks.Show}
      edit={Marks.Edit}
      create={Marks.Create}
    />
    
    {/* Academic Records & History */}
    {/* Removed attendanceRecords due to API issues */}
    
    {/* Academic Planning */}
    <Resource
      name="academicYears"
      options={{ label: "Academic Years" }}
      list={AcademicYears.List}
      show={AcademicYears.Show}
      edit={AcademicYears.Edit}
      create={AcademicYears.Create}
    />
    
    {/* Financial */}
    <Resource
      name="feeStructures"
      options={{ label: "Fee Structures" }}
      list={FeeStructures.List}
      show={FeeStructures.Show}
      edit={FeeStructures.Edit}
      create={FeeStructures.Create}
    />
    <Resource
      name="feeSchedules"
      options={{ label: "Fee Schedules" }}
      list={FeeSchedules.List}
      show={FeeSchedules.Show}
      edit={FeeSchedules.Edit}
      create={FeeSchedules.Create}
    />
    <Resource
      name="invoices"
      list={Invoices.List}
      show={Invoices.Show}
      edit={Invoices.Edit}
      create={Invoices.Create}
    />
    <Resource
      name="payments"
      list={Payments.List}
      show={Payments.Show}
      edit={Payments.Edit}
      create={Payments.Create}
    />
    
    {/* HR & Staff */}
    <Resource
      name="staff"
      list={Staff.List}
      show={Staff.Show}
      edit={Staff.Edit}
      create={Staff.Create}
    />
    <Resource
      name="teachers"
      options={{ label: "Teachers" }}
      list={Teachers.List}
      show={Teachers.Show}
      edit={Teachers.Edit}
      create={Teachers.Create}
    />
    
    {/* Timetable Management */}
    <Resource
      name="subjects"
      options={{ label: "Subjects" }}
      list={Subjects.List}
      show={Subjects.Show}
      edit={Subjects.Edit}
      create={Subjects.Create}
    />
    <Resource
      name="rooms"
      options={{ label: "Rooms" }}
      list={Rooms.List}
      show={Rooms.Show}
      edit={Rooms.Edit}
      create={Rooms.Create}
    />
    <Resource
      name="timeSlots"
      options={{ label: "Time Slots" }}
      list={TimeSlots.List}
      show={TimeSlots.Show}
      edit={TimeSlots.Edit}
      create={TimeSlots.Create}
    />
    <Resource
      name="timetablePeriods"
      options={{ label: "Timetable Periods" }}
      list={Timetable.List}
      show={Timetable.Show}
      edit={Timetable.Edit}
      create={Timetable.Create}
    />
    <Resource
      name="timetables"
      options={{ label: "Timetable Overview" }}
      list={Timetables.List}
      show={Timetables.Show}
      edit={Timetables.Edit}
      create={Timetables.Create}
    />
    <Resource
      name="sectionTimetables"
      options={{ label: "Section Timetables" }}
      show={SectionTimetables.Show}
      recordRepresentation={(record) => `${record.class?.name} - ${record.name} Timetable`}
    />
    
    {/* Communications */}
    <Resource
      name="templates"
      options={{ label: "Message Templates" }}
      list={Templates.List}
      show={Templates.Show}
      edit={Templates.Edit}
      create={Templates.Create}
    />
    <Resource
      name="campaigns"
      options={{ label: "Campaigns" }}
      list={Campaigns.List}
      show={Campaigns.Show}
      edit={Campaigns.Edit}
      create={Campaigns.Create}
    />
    <Resource
      name="messages"
      options={{ label: "Messages" }}
      list={Messages.List}
      show={Messages.Show}
      edit={Messages.Edit}
      create={Messages.Create}
    />
    <Resource
      name="tickets"
      options={{ label: "Support Tickets" }}
      list={Tickets.List}
      show={Tickets.Show}
      edit={Tickets.Edit}
      create={Tickets.Create}
    />
    <Resource
      name="preferences"
      options={{ label: "Communication Preferences" }}
      list={Preferences.List}
      show={Preferences.Show}
      edit={Preferences.Edit}
      create={Preferences.Create}
    />
    
    {/* System Administration */}
    <Resource
      name="tenants"
      options={{ label: "Tenants" }}
      list={Tenants.List}
      show={Tenants.Show}
      edit={Tenants.Edit}
      create={Tenants.Create}
    />
    
    {/* Role Switcher for Development Testing */}
    <RoleSwitcher />
  </Admin>
  );
};

export default AdminApp;