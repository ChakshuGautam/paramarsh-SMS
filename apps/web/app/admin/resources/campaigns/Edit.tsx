"use client";

import { Edit, SimpleForm, TextInput } from "@/components/admin";
import { ReferenceInput } from "@/components/admin/reference-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";

export const CampaignsEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" label="ID" disabled />
      <TextInput source="name" label="Name" />
      <ReferenceInput source="templateId" reference="templates" label="Template">
        <AutocompleteInput optionText="name" />
      </ReferenceInput>
      <TextInput 
        source="status" 
        label="Status" 
        helperText="draft, scheduled, active, completed, or paused" 
      />
      <TextInput
        source="audienceQuery"
        label="Audience Query (JSON)"
        multiline
        rows={3}
        helperText='e.g., {"type": "all_students"} or {"type": "class", "classId": "xxx"}'
      />
      <TextInput source="schedule" label="Schedule At" helperText="ISO date format" />
    </SimpleForm>
  </Edit>
);

export default CampaignsEdit;