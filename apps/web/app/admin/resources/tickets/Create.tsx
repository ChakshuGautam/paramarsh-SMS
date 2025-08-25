"use client";

import { 
  Create, 
  SimpleForm, 
  TextInput,
  SelectInput,
  ReferenceInput,
  AutocompleteInput,
  required 
} from "@/components/admin";

export const TicketsCreate = () => (
  <Create>
    <SimpleForm>
      <SelectInput 
        source="ownerType" 
        label="Owner Type" 
        choices={[
          { id: 'student', name: 'Student' },
          { id: 'parent', name: 'Parent' },
          { id: 'teacher', name: 'Teacher' },
          { id: 'staff', name: 'Staff' },
        ]}
        validate={required()}
      />
      <TextInput source="ownerId" label="Owner ID" validate={required()} />
      <TextInput source="subject" label="Subject" validate={required()} />
      <TextInput
        source="description"
        label="Description"
        multiline
        rows={5}
        validate={required()}
      />
      <SelectInput 
        source="category" 
        label="Category"
        choices={[
          { id: 'technical', name: 'Technical' },
          { id: 'academic', name: 'Academic' },
          { id: 'administrative', name: 'Administrative' },
          { id: 'billing', name: 'Billing' },
          { id: 'general', name: 'General' },
        ]}
        validate={required()}
      />
      <SelectInput 
        source="priority" 
        label="Priority"
        choices={[
          { id: 'low', name: 'Low' },
          { id: 'medium', name: 'Medium' },
          { id: 'high', name: 'High' },
          { id: 'urgent', name: 'Urgent' },
        ]}
        defaultValue="medium"
        validate={required()}
      />
      <ReferenceInput source="assigneeId" reference="staff">
        <AutocompleteInput optionText={(choice) => `${choice.firstName} ${choice.lastName}`} label="Assignee (Staff)" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

export default TicketsCreate;