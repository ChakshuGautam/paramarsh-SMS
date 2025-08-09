"use client";

import { Edit, SimpleForm, TextInput } from "@/components/admin";

export const StaffEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="firstName" label="First Name" />
      <TextInput source="lastName" label="Last Name" />
      <TextInput source="email" label="Email" />
      <TextInput source="phone" label="Phone" />
      <TextInput source="designation" label="Designation" />
      <TextInput source="department" label="Department" />
      <TextInput source="employmentType" label="Type" />
      <TextInput source="joinDate" label="Join Date" />
      <TextInput source="status" label="Status" />
    </SimpleForm>
  </Edit>
);

export default StaffEdit;
