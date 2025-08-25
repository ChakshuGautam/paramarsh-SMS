"use client";

<<<<<<< HEAD
import { 
  Edit, 
  SimpleForm, 
  TextInput,
  SelectInput,
  ReferenceInput,
  AutocompleteInput,
  required 
} from "@/components/admin";
=======
import { Edit, SimpleForm, TextInput } from "@/components/admin";
>>>>>>> origin/main

export const TicketsEdit = () => (
  <Edit>
    <SimpleForm>
<<<<<<< HEAD
      <TextInput source="subject" label="Subject" validate={required()} />
=======
      <TextInput source="id" label="ID" disabled />
      <TextInput source="subject" label="Subject" />
>>>>>>> origin/main
      <TextInput
        source="description"
        label="Description"
        multiline
        rows={5}
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
    </SimpleForm>
  </Edit>
);

export default TicketsEdit;