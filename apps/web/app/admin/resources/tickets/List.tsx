"use client";

import { List, DataTable, TextField } from "@/components/admin";

export const TicketsList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col source="subject" label="Subject" />
      <DataTable.Col source="category" label="Category" />
      <DataTable.Col source="priority" label="Priority" />
      <DataTable.Col source="status" label="Status" />
      <DataTable.Col source="ownerType" label="Owner Type" />
      <DataTable.Col source="ownerId" label="Owner ID" />
      <DataTable.Col source="assigneeId" label="Assignee" />
      <DataTable.Col source="createdAt" label="Created" />
    </DataTable>
  </List>
);

export default TicketsList;