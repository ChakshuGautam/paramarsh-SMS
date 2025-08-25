"use client";

<<<<<<< HEAD
import { useListContext, useRecordContext } from "ra-core";
=======
import { useListContext } from "ra-core";
>>>>>>> origin/main
import {
  DataTable,
  List,
  ReferenceField,
  TextField,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  SelectInput,
<<<<<<< HEAD
=======
  DateInput,
>>>>>>> origin/main
  Count,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
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
<<<<<<< HEAD
  <ReferenceInput source="classId" reference="classes">
    <AutocompleteInput placeholder="Filter by class" label="" optionText="name" />
  </ReferenceInput>,
  <SelectInput 
    source="recurrence" 
    placeholder="Filter by recurrence" 
=======
  <SelectInput 
    source="frequency" 
    placeholder="Filter by frequency" 
>>>>>>> origin/main
    label="" 
    choices={[
      { id: 'monthly', name: 'Monthly' },
      { id: 'quarterly', name: 'Quarterly' },
      { id: 'annually', name: 'Annually' },
      { id: 'one_time', name: 'One Time' }
    ]} 
  />,
<<<<<<< HEAD
  <SelectInput 
    source="status" 
    placeholder="Filter by status" 
    label="" 
    choices={[
      { id: 'active', name: 'Active' },
      { id: 'inactive', name: 'Inactive' }
    ]} 
  />,
=======
  <DateInput source="dueDate" placeholder="Filter by due date" label="" />,
>>>>>>> origin/main
];

export const FeeSchedulesList = () => {
  return (
    <List
<<<<<<< HEAD
      sort={{ field: "dueDayOfMonth", order: "ASC" }}
=======
      sort={{ field: "dueDate", order: "ASC" }}
>>>>>>> origin/main
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
<<<<<<< HEAD
    const statusFilter = getStatusFilter(value);
    setFilters({ ...filterValues, ...statusFilter }, displayedFilters);
=======
    const dueDateFilter = getDueDateFilter(value);
    setFilters({ ...filterValues, ...dueDateFilter }, displayedFilters);
>>>>>>> origin/main
  };
  
  // Determine current tab based on filter values
  const getCurrentTab = () => {
<<<<<<< HEAD
    if (filterValues.status === "active") return "current";
    if (filterValues.status === "inactive") return "inactive";
=======
    const today = format(new Date(), "yyyy-MM-dd");
    
    if (filterValues.dueDate_gt === today) return "upcoming";
    if (filterValues.dueDate === today) return "current";
    if (filterValues.dueDate_lt === today) return "overdue";
>>>>>>> origin/main
    return "all";
  };
  
  return (
    <Tabs value={getCurrentTab()}>
      <TabsList>
        <TabsTrigger value="current" onClick={handleChange("current")}>
<<<<<<< HEAD
          Active Schedules
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getStatusFilter("current") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="inactive" onClick={handleChange("inactive")}>
          Inactive Schedules
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getStatusFilter("inactive") }} />
=======
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
>>>>>>> origin/main
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="all" onClick={handleChange("all")}>
          All Schedules
          <Badge variant="outline" className="ml-2">
<<<<<<< HEAD
            <Count filter={{ ...filterValues, ...getStatusFilter("all") }} />
=======
            <Count filter={{ ...filterValues, ...getDueDateFilter("all") }} />
>>>>>>> origin/main
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="current">
        <FeeSchedulesTable storeKey={storeKeyByStatus.current} />
      </TabsContent>
<<<<<<< HEAD
      <TabsContent value="inactive">
        <FeeSchedulesTable storeKey="feeSchedules.list.inactive" />
=======
      <TabsContent value="upcoming">
        <FeeSchedulesTable storeKey={storeKeyByStatus.upcoming} />
      </TabsContent>
      <TabsContent value="overdue">
        <FeeSchedulesTable storeKey={storeKeyByStatus.overdue} />
>>>>>>> origin/main
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
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
    </DataTable.Col>
    <DataTable.Col label="Fee Structure" className="hidden lg:table-cell">
      <ReferenceField reference="feeStructures" source="feeStructureId">
        <TextField source="name" />
      </ReferenceField>
    </DataTable.Col>
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
    </Badge>
  );
};

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
    </Badge>
  );
};

<<<<<<< HEAD
const RecurrenceBadge = () => {
  const record = useRecordContext();
  if (!record || !record.recurrence) return <span className="text-gray-400">-</span>;
=======
const FrequencyBadge = ({ record }: { record?: any }) => {
  if (!record || !record.frequency) return null;
>>>>>>> origin/main
  
  const colors = {
    monthly: 'text-blue-700 bg-blue-100',
    quarterly: 'text-purple-700 bg-purple-100',
    annually: 'text-green-700 bg-green-100',
    one_time: 'text-gray-700 bg-gray-100',
  };
  
  return (
<<<<<<< HEAD
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

=======
    <Badge className={colors[record.frequency as keyof typeof colors] || 'text-gray-700 bg-gray-100'}>
      {record.frequency.replace('_', ' ')}
    </Badge>
  );
};
>>>>>>> origin/main
