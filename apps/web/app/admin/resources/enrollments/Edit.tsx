"use client";

import { Edit, SimpleForm, TextInput, SelectInput } from "@/components/admin";

export const EnrollmentsEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="studentId" label="Student ID" disabled />
      <TextInput source="classId" label="Class ID" />
      <TextInput source="sectionId" label="Section ID" />
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
      />
      <TextInput source="startDate" label="Start Date" />
      <TextInput source="endDate" label="End Date" />
    </SimpleForm>
  </Edit>
);

export default EnrollmentsEdit;





