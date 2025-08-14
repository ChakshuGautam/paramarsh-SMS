"use client";

import { List, DataTable, TextField } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";

export const CampaignsList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col source="name" label="Name" />
      <DataTable.Col label="Template">
        <ReferenceField reference="templates" source="templateId">
          <TextField source="name" />
        </ReferenceField>
      </DataTable.Col>
      <DataTable.Col source="status" label="Status" />
      <DataTable.Col source="schedule" label="Scheduled" />
      <DataTable.Col source="createdAt" label="Created" />
    </DataTable>
  </List>
);

export default CampaignsList;