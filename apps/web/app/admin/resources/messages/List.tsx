"use client";

import { List, DataTable, TextField, SelectInput, ReferenceInput, DateInput, TextInput } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";

const messageFilters = [
  <SelectInput source="channel" label="Filter by Channel" choices={[
    { id: 'SMS', name: 'SMS' },
    { id: 'EMAIL', name: 'Email' },
    { id: 'PUSH', name: 'Push Notification' },
    { id: 'WHATSAPP', name: 'WhatsApp' }
  ]} />,
  <SelectInput source="status" label="Filter by Status" choices={[
    { id: 'pending', name: 'Pending' },
    { id: 'sent', name: 'Sent' },
    { id: 'failed', name: 'Failed' },
    { id: 'delivered', name: 'Delivered' }
  ]} />,
  <ReferenceInput source="templateId" reference="templates" label="Filter by Template">
    <SelectInput source="templateId" optionText="name" />
  </ReferenceInput>,
  <ReferenceInput source="campaignId" reference="campaigns" label="Filter by Campaign">
    <SelectInput source="campaignId" optionText="name" />
  </ReferenceInput>,
  <TextInput source="to" label="Filter by Recipient" />,
  <DateInput source="sentAt_gte" label="Filter by Sent After" />,
  <DateInput source="sentAt_lte" label="Filter by Sent Before" />,
];

export const MessagesList = () => (
  <List filters={messageFilters}>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col source="channel" label="Channel" />
      <DataTable.Col source="to" label="To" />
      <DataTable.Col label="Template">
        <ReferenceField reference="templates" source="templateId">
          <TextField source="name" />
        </ReferenceField>
      </DataTable.Col>
      <DataTable.Col label="Campaign">
        <ReferenceField reference="campaigns" source="campaignId">
          <TextField source="name" />
        </ReferenceField>
      </DataTable.Col>
      <DataTable.Col source="status" label="Status" />
      <DataTable.Col source="sentAt" label="Sent At" />
    </DataTable>
  </List>
);

export default MessagesList;