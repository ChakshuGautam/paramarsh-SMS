"use client";

import { 
  Edit, 
  SimpleForm, 
  TextInput,
  SelectInput,
  ReferenceInput,
  AutocompleteInput,
  required 
} from "@/components/admin";

export const TicketsEdit = () => (
  <Edit>
    <SimpleForm>
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
        validate={required()}
      />
      <SelectInput 
        source="status" 
        label="Status"
        choices={[
          { id: 'open', name: 'Open' },
          { id: 'in_progress', name: 'In Progress' },
          { id: 'resolved', name: 'Resolved' },
          { id: 'closed', name: 'Closed' },
        ]}
        validate={required()}
      />
      <ReferenceInput source="assigneeId" reference="staff">
        <AutocompleteInput optionText={(choice) => `${choice.firstName} ${choice.lastName}`} label="Assignee (Staff)" />
      </ReferenceInput>
    </SimpleForm>
  </Edit>
);

export default TicketsEdit;