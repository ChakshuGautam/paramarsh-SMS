"use client";

import { 
  Show, 
  SimpleShowLayout, 
  TextField,
  ReferenceField
} from "@/components/admin";

export const MessagesShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="channel" label="Channel" />
      <TextField source="to" label="To" />
      <ReferenceField reference="templates" source="templateId" label="Template">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField reference="campaigns" source="campaignId" label="Campaign">
        <TextField source="name" />
      </ReferenceField>
      <TextField source="payload" label="Payload (JSON)" />
      <TextField source="status" label="Status" />
      <TextField source="providerId" label="Provider ID" />
      <TextField source="error" label="Error" />
      <TextField source="sentAt" label="Sent At" />
      <TextField source="createdAt" label="Created" />
      <TextField source="updatedAt" label="Updated" />
    </SimpleShowLayout>
  </Show>
);

export default MessagesShow;