"use client";

import { 
  Edit, 
  SimpleForm, 
  TextInput,
  SelectInput,
  DateInput,
  required 
} from "@/components/admin";
import { ReferenceInput } from "@/components/admin/reference-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";

export const CampaignsEdit = () => (
  <Edit>
    <SimpleForm>
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
      />
      <TextInput
        source="audienceQuery"
        label="Audience Query (JSON)"
        multiline
        rows={3}
        helperText='e.g., {"type": "all_students"} or {"type": "class", "classId": "xxx"}'
      />
      <DateInput source="schedule" label="Schedule At" />
    </SimpleForm>
  </Edit>
);

export default CampaignsEdit;