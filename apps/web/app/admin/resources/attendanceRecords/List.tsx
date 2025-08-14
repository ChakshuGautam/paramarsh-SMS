"use client";

import { useListContext } from "ra-core";
import {
  DataTable,
  List,
  ReferenceField,
  TextField,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  SelectInput,
  DateInput,
  Count,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";

// Store keys for different date ranges
const storeKeyByDateRange = {
  today: "attendanceRecords.list.today",
  yesterday: "attendanceRecords.list.yesterday",
  thisWeek: "attendanceRecords.list.thisWeek",
  thisMonth: "attendanceRecords.list.thisMonth",
  all: "attendanceRecords.list.all",
};

// Helper function to get date filters
const getDateFilter = (range: string) => {
  const today = new Date();
  switch (range) {
    case "today":
      return { date: format(today, "yyyy-MM-dd") };
    case "yesterday":
      return { date: format(subDays(today, 1), "yyyy-MM-dd") };
    case "thisWeek":
      return { date_gte: format(startOfWeek(today), "yyyy-MM-dd") };
    case "thisMonth":
      return { date_gte: format(startOfMonth(today), "yyyy-MM-dd") };
    default:
      return {};
  }
};

// Label-less filters with placeholders
const attendanceFilters = [
  <TextInput source="q" placeholder="Search students..." label={false} alwaysOn />,
  <ReferenceInput source="studentId" reference="students">
    <AutocompleteInput 
      placeholder="Filter by student" 
      label={false} 
      optionText={(record) => `${record.firstName} ${record.lastName}`}
    />
  </ReferenceInput>,
  <SelectInput 
    source="status" 
    placeholder="Filter by status" 
    label={false} 
    choices={[
      { id: 'present', name: 'Present' },
      { id: 'absent', name: 'Absent' },
      { id: 'late', name: 'Late' },
      { id: 'excused', name: 'Excused' }
    ]} 
  />,
  <DateInput source="date" placeholder="Filter by date" label={false} />,
];

export const AttendanceRecordsList = () => (
  <List
    sort={{ field: "date", order: "DESC" }}
    filterDefaultValues={{ ...getDateFilter("today") }}
    filters={attendanceFilters}
    perPage={25}
  >
    <TabbedDataTable />
  </List>
);

const TabbedDataTable = () => {
  const listContext = useListContext();
  const { filterValues, setFilters, displayedFilters } = listContext;
  
  const handleChange = (value: string) => () => {
    const dateFilter = getDateFilter(value);
    setFilters({ ...filterValues, ...dateFilter }, displayedFilters);
  };
  
  // Determine current tab based on filter values
  const getCurrentTab = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
    
    if (filterValues.date === today) return "today";
    if (filterValues.date === yesterday) return "yesterday";
    if (filterValues.date_gte === format(startOfWeek(new Date()), "yyyy-MM-dd")) return "thisWeek";
    if (filterValues.date_gte === format(startOfMonth(new Date()), "yyyy-MM-dd")) return "thisMonth";
    return "all";
  };
  
  return (
    <Tabs value={getCurrentTab()}>
      <TabsList>
        <TabsTrigger value="today" onClick={handleChange("today")}>
          Today
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getDateFilter("today") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="yesterday" onClick={handleChange("yesterday")}>
          Yesterday
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getDateFilter("yesterday") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="thisWeek" onClick={handleChange("thisWeek")}>
          This Week
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getDateFilter("thisWeek") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="thisMonth" onClick={handleChange("thisMonth")}>
          This Month
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getDateFilter("thisMonth") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="all" onClick={handleChange("all")}>
          All Records
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getDateFilter("all") }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="today">
        <AttendanceTable storeKey={storeKeyByDateRange.today} />
      </TabsContent>
      <TabsContent value="yesterday">
        <AttendanceTable storeKey={storeKeyByDateRange.yesterday} />
      </TabsContent>
      <TabsContent value="thisWeek">
        <AttendanceTable storeKey={storeKeyByDateRange.thisWeek} />
      </TabsContent>
      <TabsContent value="thisMonth">
        <AttendanceTable storeKey={storeKeyByDateRange.thisMonth} />
      </TabsContent>
      <TabsContent value="all">
        <AttendanceTable storeKey={storeKeyByDateRange.all} />
      </TabsContent>
    </Tabs>
  );
};

const AttendanceTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
    storeKey={storeKey}
    rowClassName={(record) => {
      const statusColors = {
        present: 'border-l-4 border-l-green-500',
        absent: 'border-l-4 border-l-red-500',
        late: 'border-l-4 border-l-yellow-500',
        excused: 'border-l-4 border-l-blue-500',
      };
      return statusColors[record.status] || '';
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col label="Student">
      <ReferenceField reference="students" source="studentId">
        <TextField source="firstName" />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.Col source="status" label="Status">
      <StatusBadge />
    </DataTable.Col>
    <DataTable.Col source="date" label="Date" />
    
    {/* Desktop-only columns */}
    <DataTable.Col source="markedBy" label="Marked By" className="hidden md:table-cell" />
    <DataTable.Col source="source" label="Source" className="hidden lg:table-cell" />
    <DataTable.Col source="id" label="ID" className="hidden lg:table-cell" />
  </DataTable>
);

const StatusBadge = ({ record }: { record?: any }) => {
  if (!record) return null;
  
  const variants = {
    present: 'default',
    absent: 'destructive',
    late: 'warning',
    excused: 'secondary',
  } as const;
  
  return (
    <Badge variant={variants[record.status as keyof typeof variants] || 'default'}>
      {record.status}
    </Badge>
  );
};

export default AttendanceRecordsList;
