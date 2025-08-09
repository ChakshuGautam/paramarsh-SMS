"use client";

import { List, DataTable, TextField } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";

export const EnrollmentsList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col label="Student">
        <ReferenceField reference="students" source="studentId">
          <TextField source="firstName" />
        </ReferenceField>
      </DataTable.Col>
      <DataTable.Col label="Section">
        <ReferenceField reference="sections" source="sectionId">
          <TextField source="name" />
        </ReferenceField>
      </DataTable.Col>
      <DataTable.Col source="status" label="Status" />
      <DataTable.Col source="startDate" label="Start" />
      <DataTable.Col source="endDate" label="End" />
    </DataTable>
  </List>
);

export default EnrollmentsList;
