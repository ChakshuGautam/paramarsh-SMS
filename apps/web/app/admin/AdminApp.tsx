"use client";

import { Admin } from "@/components/admin";
import { Resource, type DataProvider as RADataProvider } from "ra-core";
import { dataProvider } from "./DataProvider";
import authProvider from "./authProvider";
import * as Students from "./resources/students";
import * as Guardians from "./resources/guardians";
import * as AdmissionsApplications from "./resources/admissionsApplications";
import * as Exams from "./resources/exams";
import * as FeeStructures from "./resources/feeStructures";
import * as Invoices from "./resources/invoices";
import * as Payments from "./resources/payments";
import * as Classes from "./resources/classes";
import * as Sections from "./resources/sections";
import * as Enrollments from "./resources/enrollments";
import * as Marks from "./resources/marks";
import * as AttendanceRecords from "./resources/attendanceRecords";
import * as Staff from "./resources/staff";
import * as Teachers from "./resources/teachers";

const raDataProvider = dataProvider as unknown as RADataProvider;

const AdminApp = () => (
  <Admin dataProvider={raDataProvider} authProvider={authProvider}>
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
      name="admissionsApplications"
      options={{ label: "Applications" }}
      list={AdmissionsApplications.List}
      show={AdmissionsApplications.Show}
      edit={AdmissionsApplications.Edit}
      create={AdmissionsApplications.Create}
    />
    <Resource
      name="exams"
      list={Exams.List}
      show={Exams.Show}
      edit={Exams.Edit}
      create={Exams.Create}
    />
    <Resource
      name="feeStructures"
      options={{ label: "Fee Structures" }}
      list={FeeStructures.List}
      show={FeeStructures.Show}
      edit={FeeStructures.Edit}
      create={FeeStructures.Create}
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
    <Resource name="marks" list={Marks.List} show={Marks.Show} />
    <Resource
      name="attendanceRecords"
      options={{ label: "Attendance" }}
      list={AttendanceRecords.List}
      show={AttendanceRecords.Show}
      edit={AttendanceRecords.Edit}
      create={AttendanceRecords.Create}
    />
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
  </Admin>
);

export default AdminApp;
