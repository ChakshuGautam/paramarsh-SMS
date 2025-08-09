"use client";

import { List, DataTable, TextField } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";

export const MarksList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col label="Student">
        <ReferenceField reference="students" source="studentId">
          <TextField source="firstName" />
        </ReferenceField>
      </DataTable.Col>
      <DataTable.Col label="Session">
        <ReferenceField reference="exams" source="sessionId">
          <TextField source="name" />
        </ReferenceField>
      </DataTable.Col>
      <DataTable.Col source="rawMarks" label="Marks" />
      <DataTable.Col source="grade" label="Grade" />
    </DataTable>
  </List>
);

export default MarksList;
