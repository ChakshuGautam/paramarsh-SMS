"use client";

import { List, DataTable, TextField } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";

export const SectionsList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col label="Class">
        <ReferenceField reference="classes" source="classId">
          <TextField source="name" />
        </ReferenceField>
      </DataTable.Col>
      <DataTable.Col source="name" label="Section" />
      <DataTable.Col source="capacity" label="Capacity" />
    </DataTable>
  </List>
);

export default SectionsList;
