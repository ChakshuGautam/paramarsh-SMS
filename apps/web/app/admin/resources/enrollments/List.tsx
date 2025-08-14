"use client";

import { List, DataTable, TextField, SelectInput, ReferenceInput, DateRangeInput } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";

const enrollmentFilters = [
  <ReferenceInput source="studentId" reference="students" label="Filter by Student">
    <SelectInput source="studentId" optionText={(record: any) => `${record.firstName} ${record.lastName}`} />
  </ReferenceInput>,
  <ReferenceInput source="sectionId" reference="sections" label="Filter by Section">
    <SelectInput source="sectionId" optionText="name" />
  </ReferenceInput>,
  <SelectInput source="status" label="Filter by Status" choices={[
    { id: 'active', name: 'Active' },
    { id: 'inactive', name: 'Inactive' },
    { id: 'transferred', name: 'Transferred' },
    { id: 'graduated', name: 'Graduated' },
    { id: 'dropped', name: 'Dropped' }
  ]} />,
  <DateRangeInput 
    source="enrollment"
    sourceFrom="startDate_gte"
    sourceTo="endDate_lte"
    label="Filter by Period" 
    placeholder="Select enrollment period"
  />,
];

export const EnrollmentsList = () => (
  <List filters={enrollmentFilters}>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col label="Student">
        <ReferenceField reference="students" source="studentId">
          <TextField source="firstName" />
        </ReferenceField>
      </DataTable.Col>
      <DataTable.Col label="Section">
        <ReferenceField reference="sections" source="sectionId">
          <TextField source="name" />
        </ReferenceField>
      </DataTable.Col>
      <DataTable.Col source="status" label="Status" />
      <DataTable.Col source="startDate" label="Start" />
      <DataTable.Col source="endDate" label="End" />
    </DataTable>
  </List>
);

export default EnrollmentsList;
