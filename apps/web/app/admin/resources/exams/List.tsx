"use client";

import { List, DataTable, SearchInput, DateRangeInput } from "@/components/admin";

const examFilters = [
  <SearchInput source="q" placeholder="Search exams..." alwaysOn />,
  <DateRangeInput 
    source="examPeriod"
    sourceFrom="startDate_gte"
    sourceTo="endDate_lte"
    label="Filter by Period" 
    placeholder="Select exam date range"
  />,
];

export const ExamsList = () => (
  <List filters={examFilters}>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col source="name" label="Name" />
      <DataTable.Col source="startDate" label="Start" />
      <DataTable.Col source="endDate" label="End" />
    </DataTable>
  </List>
);

export default ExamsList;
