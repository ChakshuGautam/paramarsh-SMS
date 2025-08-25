"use client";

import { useListContext, useRecordContext } from "ra-core";
import {
  DataTable,
  List,
  ReferenceField,
  TextField,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  SelectInput,
  Count,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

// Store keys for different status tabs
const storeKeyByStatus = {
  current: "feeSchedules.list.current",
  inactive: "feeSchedules.list.inactive",
  all: "feeSchedules.list.all",
};

// Helper function to get status-based filters
const getStatusFilter = (status: string) => {
  switch (status) {
    case "current":
      return { status: "active" };
    case "inactive":
      return { status: "inactive" };
    default:
      return {};
  }
};

// Label-less filters with placeholders
const feeScheduleFilters = [
  <TextInput source="q" placeholder="Search fee schedules..." label="" alwaysOn />,
  <ReferenceInput source="feeStructureId" reference="feeStructures">
    <AutocompleteInput placeholder="Filter by fee structure" label="" optionText="name" />
  </ReferenceInput>,
  <ReferenceInput source="classId" reference="classes">
    <AutocompleteInput placeholder="Filter by class" label="" optionText="name" />
  </ReferenceInput>,
  <SelectInput 
    source="recurrence" 
    placeholder="Filter by recurrence" 
    label="" 
    choices={[
      { id: 'monthly', name: 'Monthly' },
      { id: 'quarterly', name: 'Quarterly' },
      { id: 'annually', name: 'Annually' },
      { id: 'one_time', name: 'One Time' }
    ]} 
  />,
  <SelectInput 
    source="status" 
    placeholder="Filter by status" 
    label="" 
    choices={[
      { id: 'active', name: 'Active' },
      { id: 'inactive', name: 'Inactive' }
    ]} 
  />,
];

export const FeeSchedulesList = () => {
  return (
    <List
      sort={{ field: "dueDayOfMonth", order: "ASC" }}
      filters={feeScheduleFilters}
      perPage={10}
    >
      <TabbedDataTable />
    </List>
  );
};

const TabbedDataTable = () => {
  const listContext = useListContext();
  const { filterValues, setFilters, displayedFilters } = listContext;
  
  const handleChange = (value: string) => () => {
    const statusFilter = getStatusFilter(value);
    setFilters({ ...filterValues, ...statusFilter }, displayedFilters);
  };
  
  // Determine current tab based on filter values
  const getCurrentTab = () => {
    if (filterValues.status === "active") return "current";
    if (filterValues.status === "inactive") return "inactive";
    return "all";
  };
  
  return (
    <Tabs value={getCurrentTab()}>
      <TabsList>
        <TabsTrigger value="current" onClick={handleChange("current")}>
          Active Schedules
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getStatusFilter("current") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="inactive" onClick={handleChange("inactive")}>
          Inactive Schedules
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getStatusFilter("inactive") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="all" onClick={handleChange("all")}>
          All Schedules
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getStatusFilter("all") }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="current">
        <FeeSchedulesTable storeKey={storeKeyByStatus.current} />
      </TabsContent>
      <TabsContent value="inactive">
        <FeeSchedulesTable storeKey="feeSchedules.list.inactive" />
      </TabsContent>
      <TabsContent value="all">
        <FeeSchedulesTable storeKey={storeKeyByStatus.all} />
      </TabsContent>
    </Tabs>
  );
};

const FeeSchedulesTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
    storeKey={storeKey}
    rowClassName={(record) => {
      if (record.status === 'active') {
        return 'border-l-4 border-l-green-500'; // active
      } else if (record.status === 'inactive') {
        return 'border-l-4 border-l-gray-500'; // inactive
      }
      return 'border-l-4 border-l-blue-500'; // default
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col source="dueDayOfMonth" label="Due Day">
      <DueDayBadge />
    </DataTable.Col>
    <DataTable.Col source="status" label="Status">
      <StatusBadge />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
    <DataTable.Col source="recurrence" label="Recurrence" className="hidden md:table-cell">
      <RecurrenceBadge />
    </DataTable.Col>
    <DataTable.Col label="Class" className="hidden md:table-cell">
      <ReferenceField reference="classes" source="classId">
        <TextField source="name" />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.Col label="Fee Structure" className="hidden lg:table-cell">
      <ReferenceField reference="feeStructures" source="feeStructureId">
        <TextField source="name" />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.Col source="startDate" label="Period" className="hidden lg:table-cell">
      <PeriodBadge />
    </DataTable.Col>
  </DataTable>
);

const ScheduleIdBadge = () => {
  const record = useRecordContext();
  if (!record || !record.id) return <span className="text-gray-400">-</span>;
  
  // Show first 8 characters of ID for readability
  const truncatedId = record.id.substring(0, 8);
  
  return (
    <Badge variant="outline" className="font-mono text-xs">
      {truncatedId}...
    </Badge>
  );
};

const DueDayBadge = () => {
  const record = useRecordContext();
  if (!record || !record.dueDayOfMonth) return <span className="text-gray-400">-</span>;
  
  const day = record.dueDayOfMonth;
  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  
  return (
    <Badge className="text-blue-700 bg-blue-100">
      {getOrdinal(day)} of month
    </Badge>
  );
};

const StatusBadge = () => {
  const record = useRecordContext();
  if (!record || !record.status) return <span className="text-gray-400">-</span>;
  
  const colors = {
    active: 'text-green-700 bg-green-100',
    inactive: 'text-gray-700 bg-gray-100',
  };
  
  return (
    <Badge className={colors[record.status as keyof typeof colors] || 'text-gray-700 bg-gray-100'}>
      {record.status.toUpperCase()}
    </Badge>
  );
};

const RecurrenceBadge = () => {
  const record = useRecordContext();
  if (!record || !record.recurrence) return <span className="text-gray-400">-</span>;
  
  const colors = {
    monthly: 'text-blue-700 bg-blue-100',
    quarterly: 'text-purple-700 bg-purple-100',
    annually: 'text-green-700 bg-green-100',
    one_time: 'text-gray-700 bg-gray-100',
  };
  
  return (
    <Badge className={colors[record.recurrence as keyof typeof colors] || 'text-gray-700 bg-gray-100'}>
      {record.recurrence.replace('_', ' ').toUpperCase()}
    </Badge>
  );
};

const PeriodBadge = () => {
  const record = useRecordContext();
  if (!record || !record.startDate) return <span className="text-gray-400">-</span>;
  
  const startDate = formatDate(record.startDate, 'MMM yyyy');
  const endDate = record.endDate ? formatDate(record.endDate, 'MMM yyyy') : 'Ongoing';
  
  return (
    <Badge variant="outline" className="text-gray-600">
      {startDate} - {endDate}
    </Badge>
  );
};

