"use client";

<<<<<<< HEAD
import { 
  Create, 
  SimpleForm, 
  TextInput,
  SelectInput,
  NumberInput,
  required 
} from "@/components/admin";
=======
import { Create, SimpleForm, TextInput } from "@/components/admin";
>>>>>>> origin/main

export const AdmissionsApplicationsCreate = () => (
  <Create>
    <SimpleForm>
<<<<<<< HEAD
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
=======
      <TextInput source="programId" label="Program" />
      <TextInput source="status" label="Status" />
      <TextInput source="score" label="Score" />
>>>>>>> origin/main
    </SimpleForm>
  </Create>
);

export default AdmissionsApplicationsCreate;



