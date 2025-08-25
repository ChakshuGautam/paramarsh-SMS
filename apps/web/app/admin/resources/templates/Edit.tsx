"use client";

import { 
  Edit, 
  SimpleForm, 
  TextInput,
  SelectInput,
  required 
} from "@/components/admin";

export const TemplatesEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" label="Name" validate={required()} />
      <SelectInput 
        source="channel" 
        label="Channel" 
        choices={[
          { id: 'EMAIL', name: 'Email' },
          { id: 'SMS', name: 'SMS' },
          { id: 'PUSH', name: 'Push Notification' },
          { id: 'WHATSAPP', name: 'WhatsApp' },
        ]}
        validate={required()}
      />
      <SelectInput 
        source="locale" 
        label="Locale"
        choices={[
          { id: 'en', name: 'English' },
          { id: 'hi', name: 'Hindi' },
          { id: 'ta', name: 'Tamil' },
          { id: 'te', name: 'Telugu' },
        ]}
        defaultValue="en"
        validate={required()}
      />
      <TextInput
        source="content"
        label="Content"
        multiline
        rows={5}
        helperText="Use {{variableName}} for variables"
        validate={required()}
      />
      <TextInput
        source="variables"
        label="Variables (JSON)"
        helperText='e.g., ["studentName", "guardianName", "dueDate"]'
        multiline
        rows={2}
      />
    </SimpleForm>
  </Edit>
);

export default TemplatesEdit;