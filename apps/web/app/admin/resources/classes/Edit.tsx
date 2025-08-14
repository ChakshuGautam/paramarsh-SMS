"use client";

import { Edit, SimpleForm, TextInput } from "@/components/admin";

export const ClassesEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" label="Name" />
      <TextInput source="gradeLevel" label="Grade" />
    </SimpleForm>
  </Edit>
);

export default ClassesEdit;




