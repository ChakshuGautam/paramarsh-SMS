"use client";

import { Edit, SimpleForm, TextInput } from "@/components/admin";

export const TicketsEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" label="ID" disabled />
      <TextInput source="subject" label="Subject" />
      <TextInput
        source="description"
        label="Description"
        multiline
        rows={5}
      />
      <TextInput 
        source="category" 
        label="Category" 
        helperText="academic, fees, technical, or general"
      />
      <TextInput 
        source="priority" 
        label="Priority" 
        helperText="low, normal, high, or urgent"
      />
      <TextInput 
        source="status" 
        label="Status" 
        helperText="open, in_progress, resolved, or closed"
      />
      <TextInput source="assigneeId" label="Assignee ID" />
    </SimpleForm>
  </Edit>
);

export default TicketsEdit;