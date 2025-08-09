"use client";

import { Show, SimpleShowLayout, TextField } from "@/components/admin";

export const StaffShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="firstName" label="First Name" />
      <TextField source="lastName" label="Last Name" />
      <TextField source="email" label="Email" />
      <TextField source="phone" label="Phone" />
      <TextField source="designation" label="Designation" />
      <TextField source="department" label="Department" />
      <TextField source="employmentType" label="Type" />
      <TextField source="joinDate" label="Join Date" />
      <TextField source="status" label="Status" />
    </SimpleShowLayout>
  </Show>
);

export default StaffShow;
