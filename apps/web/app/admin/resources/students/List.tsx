"use client";

import { List, DataTable, TextField } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";

export const StudentsList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col source="admissionNo" label="Admission No" />
      <DataTable.Col source="firstName" label="First Name" />
      <DataTable.Col source="lastName" label="Last Name" />
      <DataTable.Col source="gender" label="Gender" />
      <DataTable.Col label="Class">
        <ReferenceField reference="classes" source="classId">
          <TextField source="name" />
        </ReferenceField>
      </DataTable.Col>
      <DataTable.Col label="Section">
        <ReferenceField reference="sections" source="sectionId">
          <TextField source="name" />
        </ReferenceField>
      </DataTable.Col>
    </DataTable>
  </List>
);

export default StudentsList;
