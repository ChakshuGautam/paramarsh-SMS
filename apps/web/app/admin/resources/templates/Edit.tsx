"use client";

<<<<<<< HEAD
import { 
  Edit, 
  SimpleForm, 
  TextInput,
  SelectInput,
  required 
} from "@/components/admin";
=======
import { Edit, SimpleForm, TextInput } from "@/components/admin";
>>>>>>> origin/main

export const TemplatesEdit = () => (
  <Edit>
    <SimpleForm>
<<<<<<< HEAD
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
=======
      <TextInput source="id" label="ID" disabled />
      <TextInput source="name" label="Name" />
      <TextInput source="channel" label="Channel" helperText="email, sms, push, or whatsapp" />
      <TextInput source="locale" label="Locale" helperText="en, hi, ta, or te" />
>>>>>>> origin/main
      <TextInput
        source="content"
        label="Content"
        multiline
        rows={5}
        helperText="Use {{variableName}} for variables"
<<<<<<< HEAD
        validate={required()}
=======
>>>>>>> origin/main
      />
      <TextInput
        source="variables"
        label="Variables (JSON)"
        helperText='e.g., ["studentName", "guardianName", "dueDate"]'
<<<<<<< HEAD
        multiline
        rows={2}
=======
>>>>>>> origin/main
      />
    </SimpleForm>
  </Edit>
);

export default TemplatesEdit;