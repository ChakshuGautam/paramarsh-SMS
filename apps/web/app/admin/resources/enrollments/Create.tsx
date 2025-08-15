"use client";

import { Create, SimpleForm, TextInput, SelectInput } from "@/components/admin";

export const EnrollmentsCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="studentId" label="Student ID" />
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
        defaultValue="enrolled"
      />
      <TextInput source="startDate" label="Start Date" />
      <TextInput source="endDate" label="End Date" />
    </SimpleForm>
  </Create>
);

export default EnrollmentsCreate;





