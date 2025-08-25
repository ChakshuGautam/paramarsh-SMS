"use client";

import { 
  Create, 
  SimpleForm, 
  TextInput,
  SelectInput,
  NumberInput,
  required 
} from "@/components/admin";

export const AdmissionsApplicationsCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="programId" label="Program ID" validate={required()} />
      <SelectInput 
        source="status" 
        label="Status"
        choices={[
          { id: 'submitted', name: 'Submitted' },
          { id: 'under_review', name: 'Under Review' },
          { id: 'accepted', name: 'Accepted' },
          { id: 'rejected', name: 'Rejected' },
          { id: 'waitlisted', name: 'Waitlisted' },
        ]}
        defaultValue="submitted"
        validate={required()}
      />
      <NumberInput source="score" label="Score" />
    </SimpleForm>
  </Create>
);

export default AdmissionsApplicationsCreate;



