"use client";

import { List, DataTable, TextField } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";

export const AttendanceRecordsList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col label="Student">
        <ReferenceField reference="students" source="studentId">
          <TextField source="firstName" />
        </ReferenceField>
      </DataTable.Col>
      <DataTable.Col source="date" label="Date" />
      <DataTable.Col source="status" label="Status" />
      <DataTable.Col source="markedBy" label="Marked By" />
      <DataTable.Col source="source" label="Source" />
    </DataTable>
  </List>
);

export default AttendanceRecordsList;
