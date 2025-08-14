"use client";

import { Create, SimpleForm, TextInput } from "@/components/admin";

export const ClassesCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" label="Name" />
      <TextInput source="gradeLevel" label="Grade" />
    </SimpleForm>
  </Create>
);

export default ClassesCreate;




