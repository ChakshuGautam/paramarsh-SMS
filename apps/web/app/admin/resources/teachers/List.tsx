"use client";

import { List, DataTable } from "@/components/admin";

export const TeachersList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col source="staffId" label="Staff" />
      <DataTable.Col source="subjects" label="Subjects" />
      <DataTable.Col source="qualifications" label="Qualifications" />
      <DataTable.Col source="experienceYears" label="Experience (years)" />
    </DataTable>
  </List>
);

export default TeachersList;
