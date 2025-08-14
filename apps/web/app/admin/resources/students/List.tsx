"use client";

import { List, DataTable, TextField, SearchInput, SelectInput, ReferenceInput } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";

const studentFilters = [
  <SearchInput source="q" placeholder="Search students..." alwaysOn />,
  <ReferenceInput source="classId" reference="classes" label="Filter by Class">
    <SelectInput source="classId" optionText="name" />
  </ReferenceInput>,
  <ReferenceInput source="sectionId" reference="sections" label="Filter by Section">
    <SelectInput source="sectionId" optionText="name" />
  </ReferenceInput>,
  <SelectInput source="gender" label="Filter by Gender" choices={[
    { id: 'male', name: 'Male' },
    { id: 'female', name: 'Female' },
    { id: 'other', name: 'Other' }
  ]} />,
];

export const StudentsList = () => (
  <List filters={studentFilters}>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col source="admissionNo" label="Admission No" />
      <DataTable.Col source="firstName" label="First Name" />
      <DataTable.Col source="lastName" label="Last Name" />
      <DataTable.Col source="gender" label="Gender" />
      <DataTable.Col label="Class">
        <ReferenceField reference="classes" source="classId">
          <TextField source="name" />
        </ReferenceField>
      </DataTable.Col>
      <DataTable.Col label="Section">
        <ReferenceField reference="sections" source="sectionId">
          <TextField source="name" />
        </ReferenceField>
      </DataTable.Col>
    </DataTable>
  </List>
);

export default StudentsList;
