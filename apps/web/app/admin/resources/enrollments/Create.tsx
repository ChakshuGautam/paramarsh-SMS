"use client";

import { 
  Create, 
  SimpleForm, 
  ReferenceInput,
  AutocompleteInput,
  SelectInput,
  DateInput,
  required 
} from "@/components/admin";

export const EnrollmentsCreate = () => (
  <Create>
    <SimpleForm>
      <ReferenceInput source="studentId" reference="students" validate={required()}>
        <AutocompleteInput optionText={(choice) => `${choice.firstName} ${choice.lastName}`} label="Student" />
      </ReferenceInput>
      <ReferenceInput source="sectionId" reference="sections" validate={required()}>
        <AutocompleteInput optionText="name" label="Section" />
      </ReferenceInput>
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
        validate={required()}
      />
      <DateInput source="startDate" label="Start Date" validate={required()} />
      <DateInput source="endDate" label="End Date" />
    </SimpleForm>
  </Create>
);

export default EnrollmentsCreate;





