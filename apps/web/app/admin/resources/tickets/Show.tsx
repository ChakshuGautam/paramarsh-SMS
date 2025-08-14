"use client";

import { 
  Show, 
  SimpleShowLayout, 
  TextField,
  ArrayField,
  DataTable
} from "@/components/admin";

export const TicketsShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="subject" label="Subject" />
      <TextField source="description" label="Description" />
      <TextField source="category" label="Category" />
      <TextField source="priority" label="Priority" />
      <TextField source="status" label="Status" />
      <TextField source="ownerType" label="Owner Type" />
      <TextField source="ownerId" label="Owner ID" />
      <TextField source="assigneeId" label="Assignee ID" />
      <TextField source="slaDueAt" label="SLA Due" />
      <TextField source="resolvedAt" label="Resolved At" />
      <TextField source="closedAt" label="Closed At" />
      <TextField source="createdAt" label="Created" />
      
      <ArrayField source="messages" label="Messages">
        <DataTable>
          <DataTable.Col source="authorId" label="Author" />
          <DataTable.Col source="authorType" label="Type" />
          <DataTable.Col source="content" label="Content" />
          <DataTable.Col source="internal" label="Internal" />
          <DataTable.Col source="createdAt" label="Sent" />
        </DataTable>
      </ArrayField>
      
      <ArrayField source="attachments" label="Attachments">
        <DataTable>
          <DataTable.Col source="fileName" label="File Name" />
          <DataTable.Col source="fileSize" label="Size" />
          <DataTable.Col source="mimeType" label="Type" />
          <DataTable.Col source="createdAt" label="Uploaded" />
        </DataTable>
      </ArrayField>
    </SimpleShowLayout>
  </Show>
);

export default TicketsShow;