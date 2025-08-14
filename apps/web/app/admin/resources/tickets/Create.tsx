"use client";

import { Create, SimpleForm, TextInput } from "@/components/admin";

export const TicketsCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput 
        source="ownerType" 
        label="Owner Type" 
        helperText="student, guardian, or staff"
      />
      <TextInput source="ownerId" label="Owner ID" />
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
      <TextInput source="assigneeId" label="Assignee ID" />
    </SimpleForm>
  </Create>
);

export default TicketsCreate;