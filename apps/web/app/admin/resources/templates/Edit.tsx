"use client";

import { Edit, SimpleForm, TextInput } from "@/components/admin";

export const TemplatesEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" label="ID" disabled />
      <TextInput source="name" label="Name" />
      <TextInput source="channel" label="Channel" helperText="email, sms, push, or whatsapp" />
      <TextInput source="locale" label="Locale" helperText="en, hi, ta, or te" />
      <TextInput
        source="content"
        label="Content"
        multiline
        rows={5}
        helperText="Use {{variableName}} for variables"
      />
      <TextInput
        source="variables"
        label="Variables (JSON)"
        helperText='e.g., ["studentName", "guardianName", "dueDate"]'
      />
    </SimpleForm>
  </Edit>
);

export default TemplatesEdit;