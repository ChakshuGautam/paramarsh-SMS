"use client";

import { List, DataTable, SearchInput, SelectInput, TextInput } from "@/components/admin";

const staffFilters = [
  <SearchInput source="q" placeholder="Search staff..." alwaysOn />,
  <TextInput source="department" label="Filter by Department" />,
  <SelectInput source="status" label="Filter by Status" choices={[
    { id: 'active', name: 'Active' },
    { id: 'inactive', name: 'Inactive' },
    { id: 'on_leave', name: 'On Leave' },
    { id: 'terminated', name: 'Terminated' }
  ]} />,
  <TextInput source="designation" label="Filter by Designation" />,
];

export const StaffList = () => (
  <List filters={staffFilters}>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col source="firstName" label="First Name" />
      <DataTable.Col source="lastName" label="Last Name" />
      <DataTable.Col source="designation" label="Designation" />
      <DataTable.Col source="department" label="Department" />
      <DataTable.Col source="status" label="Status" />
    </DataTable>
  </List>
);

export default StaffList;
