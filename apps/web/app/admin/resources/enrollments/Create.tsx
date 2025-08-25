"use client";

<<<<<<< HEAD
import { 
  Create, 
  SimpleForm, 
  ReferenceInput,
  AutocompleteInput,
  SelectInput,
  DateInput,
  required 
} from "@/components/admin";
=======
import { Create, SimpleForm, TextInput, SelectInput } from "@/components/admin";
>>>>>>> origin/main

export const EnrollmentsCreate = () => (
  <Create>
    <SimpleForm>
<<<<<<< HEAD
      <ReferenceInput source="studentId" reference="students" validate={required()}>
        <AutocompleteInput optionText={(choice) => `${choice.firstName} ${choice.lastName}`} label="Student" />
      </ReferenceInput>
      <ReferenceInput source="sectionId" reference="sections" validate={required()}>
        <AutocompleteInput optionText="name" label="Section" />
      </ReferenceInput>
=======
      <TextInput source="studentId" label="Student ID" />
      <TextInput source="classId" label="Class ID" />
      <TextInput source="sectionId" label="Section ID" />
>>>>>>> origin/main
      <SelectInput 
        source="status" 
        label="Status" 
        choices={[
          { id: 'enrolled', name: 'Enrolled' },
          { id: 'active', name: 'Active' },
          { id: 'inactive', name: 'Inactive' },
          { id: 'graduated', name: 'Graduated' },
          { id: 'transferred', name: 'Transferred' },
          { id: 'dropped', name: 'Dropped' },
          { id: 'suspended', name: 'Suspended' },
          { id: 'completed', name: 'Completed' },
        ]}
        defaultValue="enrolled"
<<<<<<< HEAD
        validate={required()}
      />
      <DateInput source="startDate" label="Start Date" validate={required()} />
      <DateInput source="endDate" label="End Date" />
=======
      />
      <TextInput source="startDate" label="Start Date" />
      <TextInput source="endDate" label="End Date" />
>>>>>>> origin/main
    </SimpleForm>
  </Create>
);

export default EnrollmentsCreate;





