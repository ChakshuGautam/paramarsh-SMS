"use client";

<<<<<<< HEAD
import { 
  Edit, 
  SimpleForm, 
  TextInput,
  SelectInput,
  NumberInput,
  required 
} from "@/components/admin";
=======
import { Edit, SimpleForm, TextInput } from "@/components/admin";
>>>>>>> origin/main

export const AdmissionsApplicationsEdit = () => (
  <Edit>
    <SimpleForm>
<<<<<<< HEAD
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
=======
      <TextInput source="programId" label="Program" />
      <TextInput source="status" label="Status" />
      <TextInput source="score" label="Score" />
>>>>>>> origin/main
    </SimpleForm>
  </Edit>
);

export default AdmissionsApplicationsEdit;



