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
import { format, isAfter, isBefore } from "date-fns";

// Store keys for different status tabs
const storeKeyByStatus = {
  upcoming: "feeSchedules.list.upcoming",
  current: "feeSchedules.list.current",
  overdue: "feeSchedules.list.overdue",
  all: "feeSchedules.list.all",
};

// Helper function to get due date filters
const getDueDateFilter = (status: string) => {
  const today = format(new Date(), "yyyy-MM-dd");
  
  switch (status) {
    case "upcoming":
      return { dueDate_gt: today };
    case "current":
      return { dueDate: today };
    case "overdue":
      return { dueDate_lt: today };
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
  <SelectInput 
    source="frequency" 
    placeholder="Filter by frequency" 
    label="" 
    choices={[
      { id: 'monthly', name: 'Monthly' },
      { id: 'quarterly', name: 'Quarterly' },
      { id: 'annually', name: 'Annually' },
      { id: 'one_time', name: 'One Time' }
    ]} 
  />,
  <DateInput source="dueDate" placeholder="Filter by due date" label="" />,
];

export const FeeSchedulesList = () => {
  return (
    <List
      sort={{ field: "dueDate", order: "ASC" }}
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
    const dueDateFilter = getDueDateFilter(value);
    setFilters({ ...filterValues, ...dueDateFilter }, displayedFilters);
  };
  
  // Determine current tab based on filter values
  const getCurrentTab = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    
    if (filterValues.dueDate_gt === today) return "upcoming";
    if (filterValues.dueDate === today) return "current";
    if (filterValues.dueDate_lt === today) return "overdue";
    return "all";
  };
  
  return (
    <Tabs value={getCurrentTab()}>
      <TabsList>
        <TabsTrigger value="current" onClick={handleChange("current")}>
          Due Today
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getDueDateFilter("current") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="upcoming" onClick={handleChange("upcoming")}>
          Upcoming
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getDueDateFilter("upcoming") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="overdue" onClick={handleChange("overdue")}>
          Overdue
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getDueDateFilter("overdue") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="all" onClick={handleChange("all")}>
          All Schedules
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getDueDateFilter("all") }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="current">
        <FeeSchedulesTable storeKey={storeKeyByStatus.current} />
      </TabsContent>
      <TabsContent value="upcoming">
        <FeeSchedulesTable storeKey={storeKeyByStatus.upcoming} />
      </TabsContent>
      <TabsContent value="overdue">
        <FeeSchedulesTable storeKey={storeKeyByStatus.overdue} />
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
      const today = new Date();
      const dueDate = new Date(record.dueDate);
      
      if (isBefore(dueDate, today)) {
        return 'border-l-4 border-l-red-500'; // overdue
      } else if (format(dueDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
        return 'border-l-4 border-l-yellow-500'; // due today
      } else {
        return 'border-l-4 border-l-green-500'; // upcoming
      }
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col source="name" label="Schedule Name" />
    <DataTable.Col source="amount" label="Amount">
      <AmountBadge />
    </DataTable.Col>
    <DataTable.Col source="dueDate" label="Due Date">
      <DueDateBadge />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
    <DataTable.Col source="frequency" label="Frequency" className="hidden md:table-cell">
      <FrequencyBadge />
    </DataTable.Col>
    <DataTable.Col label="Fee Structure" className="hidden lg:table-cell">
      <ReferenceField reference="feeStructures" source="feeStructureId">
        <TextField source="name" />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.Col source="createdAt" label="Created" className="hidden lg:table-cell" />
  </DataTable>
);

const AmountBadge = ({ record }: { record?: any }) => {
  if (!record || !record.amount) return null;
  
  const amount = parseFloat(record.amount);
  const getAmountColor = () => {
    if (amount >= 10000) return 'text-red-700 bg-red-100';
    if (amount >= 5000) return 'text-orange-700 bg-orange-100';
    return 'text-green-700 bg-green-100';
  };
  
  return (
    <Badge className={getAmountColor()}>
      ₹{amount.toLocaleString()}
    </Badge>
  );
};

const DueDateBadge = ({ record }: { record?: any }) => {
  if (!record || !record.dueDate) return null;
  
  const dueDate = new Date(record.dueDate);
  const today = new Date();
  
  const getDateColor = () => {
    if (isBefore(dueDate, today)) return 'text-red-700 bg-red-100';
    if (format(dueDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) return 'text-yellow-700 bg-yellow-100';
    return 'text-green-700 bg-green-100';
  };
  
  return (
    <Badge className={getDateColor()}>
      {format(dueDate, 'MMM dd, yyyy')}
    </Badge>
  );
};

const FrequencyBadge = ({ record }: { record?: any }) => {
  if (!record || !record.frequency) return null;
  
  const colors = {
    monthly: 'text-blue-700 bg-blue-100',
    quarterly: 'text-purple-700 bg-purple-100',
    annually: 'text-green-700 bg-green-100',
    one_time: 'text-gray-700 bg-gray-100',
  };
  
  return (
    <Badge className={colors[record.frequency as keyof typeof colors] || 'text-gray-700 bg-gray-100'}>
      {record.frequency.replace('_', ' ')}
    </Badge>
  );
};