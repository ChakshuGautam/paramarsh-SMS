"use client";

import { 
  Show, 
  SimpleShowLayout, 
  TextField,
  ReferenceField
} from "@/components/admin";

export const CampaignsShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="name" label="Name" />
      <ReferenceField reference="templates" source="templateId" label="Template">
        <TextField source="name" />
      </ReferenceField>
      <TextField source="audienceQuery" label="Audience Query" />
      <TextField source="status" label="Status" />
      <TextField source="schedule" label="Scheduled At" />
      <TextField source="createdAt" label="Created" />
      <TextField source="updatedAt" label="Updated" />
    </SimpleShowLayout>
  </Show>
);

export default CampaignsShow;