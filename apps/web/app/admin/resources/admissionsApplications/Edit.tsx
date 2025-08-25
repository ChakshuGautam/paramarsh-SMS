"use client";

import { 
  Edit, 
  SimpleForm, 
  TextInput,
  SelectInput,
  NumberInput,
  required 
} from "@/components/admin";

export const AdmissionsApplicationsEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="programId" label="Program ID" disabled />
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
        validate={required()}
      />
      <NumberInput source="score" label="Score" />
    </SimpleForm>
  </Edit>
);

export default AdmissionsApplicationsEdit;



