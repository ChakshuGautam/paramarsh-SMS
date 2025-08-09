"use client";

import { Create, SimpleForm, TextInput } from "@/components/admin";

export const FeeStructuresCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="gradeId" label="Grade" />
      <TextInput source="components" label="Components" />
    </SimpleForm>
  </Create>
);

export default FeeStructuresCreate;



