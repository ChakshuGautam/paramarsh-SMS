"use client";

import { Edit, SimpleForm, TextInput } from "@/components/admin";

export const FeeStructuresEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="gradeId" label="Grade" />
      <TextInput source="components" label="Components" />
    </SimpleForm>
  </Edit>
);

export default FeeStructuresEdit;





