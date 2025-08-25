"use client";

<<<<<<< HEAD
import { 
  Edit, 
  SimpleForm, 
  TextInput,
  SelectInput,
  DateInput,
  required 
} from "@/components/admin";
=======
import { Edit, SimpleForm, TextInput } from "@/components/admin";
>>>>>>> origin/main
import { ReferenceInput } from "@/components/admin/reference-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";

export const CampaignsEdit = () => (
  <Edit>
    <SimpleForm>
<<<<<<< HEAD
      <TextInput source="name" label="Name" validate={required()} />
      <ReferenceInput source="templateId" reference="templates" label="Template" validate={required()}>
        <AutocompleteInput optionText="name" />
      </ReferenceInput>
      <SelectInput 
        source="status" 
        label="Status" 
        choices={[
          { id: 'draft', name: 'Draft' },
          { id: 'scheduled', name: 'Scheduled' },
          { id: 'running', name: 'Running' },
          { id: 'completed', name: 'Completed' },
          { id: 'paused', name: 'Paused' },
        ]}
        validate={required()}
=======
      <TextInput source="id" label="ID" disabled />
      <TextInput source="name" label="Name" />
      <ReferenceInput source="templateId" reference="templates" label="Template">
        <AutocompleteInput optionText="name" />
      </ReferenceInput>
      <TextInput 
        source="status" 
        label="Status" 
        helperText="draft, scheduled, active, completed, or paused" 
>>>>>>> origin/main
      />
      <TextInput
        source="audienceQuery"
        label="Audience Query (JSON)"
        multiline
        rows={3}
        helperText='e.g., {"type": "all_students"} or {"type": "class", "classId": "xxx"}'
      />
<<<<<<< HEAD
      <DateInput source="schedule" label="Schedule At" />
=======
      <TextInput source="schedule" label="Schedule At" helperText="ISO date format" />
>>>>>>> origin/main
    </SimpleForm>
  </Edit>
);

export default CampaignsEdit;