"use client";

import { useRecordContext } from "ra-core";
import {
  DataTable,
  List,
  TextInput,
  BooleanInput,
  TextField,
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, CheckCircle, XCircle } from "lucide-react";

const academicYearFilters = [
  <TextInput source="q" placeholder="Search academic years..." label="" alwaysOn />,
  <BooleanInput source="isActive" label="Active Only" />,
];

export const AcademicYearsList = () => (
  <List
    sort={{ field: "startDate", order: "DESC" }}
    filters={academicYearFilters}
    perPage={10}
  >
    <AcademicYearsTable />
  </List>
);

const AcademicYearsTable = () => (
  <DataTable>
    <DataTable.Col source="name" label="Academic Year">
      <AcademicYearName />
    </DataTable.Col>
    <DataTable.Col source="startDate" label="Start Date">
      <DateDisplay source="startDate" />
    </DataTable.Col>
    <DataTable.Col source="endDate" label="End Date">
      <DateDisplay source="endDate" />
    </DataTable.Col>
    <DataTable.Col source="terms" label="Terms">
      <TermsDisplay />
    </DataTable.Col>
    <DataTable.Col source="isActive" label="Status">
      <ActiveStatus />
    </DataTable.Col>
  </DataTable>
);

const AcademicYearName = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium">{record.name}</span>
    </div>
  );
};

const DateDisplay = ({ source }: { source: string }) => {
  const record = useRecordContext();
  if (!record || !record[source]) return null;
  
  return (
    <span className="text-sm">
      {format(new Date(record[source]), 'MMM dd, yyyy')}
    </span>
  );
};

const TermsDisplay = () => {
  const record = useRecordContext();
  if (!record?.terms || record.terms.length === 0) {
    return <span className="text-muted-foreground">No terms defined</span>;
  }
  
  return (
    <div className="flex gap-1">
      {record.terms.map((term: any, index: number) => (
        <Badge key={index} variant="outline" className="text-xs">
          {term.name}
        </Badge>
      ))}
    </div>
  );
};

const ActiveStatus = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  if (record.isActive) {
    return (
      <Badge className="bg-green-100 text-green-700 flex items-center gap-1 w-fit">
        <CheckCircle className="h-3 w-3" />
        Active
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="flex items-center gap-1 w-fit">
      <XCircle className="h-3 w-3" />
      Inactive
    </Badge>
  );
};

export default AcademicYearsList;