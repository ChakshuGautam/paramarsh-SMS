"use client";

import { useListContext, useRecordContext, useRedirect } from "ra-core";
import {
  DataTable,
  List,
  ReferenceField,
  TextField,
  Count,
  TextInput,
  SelectInput,
  DateInput,
  ListPagination,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";
import { Check, X, Clock, Shield, AlertCircle, Calendar, BarChart3 } from "lucide-react";
import { formatDate } from "@/lib/utils";

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

// Standardized filters using filter components
const attendanceFilters = [
  <TextInput source="q" placeholder="Search students..." label="" alwaysOn />,
  <SelectInput 
    source="studentId" 
    placeholder="Filter by student" 
    label=""
    choices={[]} // Would need to be populated with student data
  />,
  <SelectInput 
    source="status" 
    placeholder="Filter by attendance status" 
    label=""
    choices={[
      { id: 'present', name: 'Present' },
      { id: 'absent', name: 'Absent' },
      { id: 'late', name: 'Late' },
      { id: 'excused', name: 'Excused' },
      { id: 'sick', name: 'Sick' },
      { id: 'partial', name: 'Partial' }
    ]}
  />,
  <DateInput source="date" placeholder="Filter by date" label="" />,
];

const ListActions = () => {
  const redirect = useRedirect();
  
  return (
    <Button
      variant="default"
      onClick={() => redirect('/admin/attendance-dashboard')}
      className="gap-2"
    >
      <BarChart3 className="w-4 h-4" />
      View Dashboard
    </Button>
  );
};

export const AttendanceRecordsList = () => (
  <List
    sort={{ field: "date", order: "DESC" }}
    filterDefaultValues={{ ...getDateFilter("today") }}
    filters={attendanceFilters}
    perPage={10}
    pagination={false}
    actions={<ListActions />}
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
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
      <TabsContent value="yesterday">
        <AttendanceTable storeKey={storeKeyByDateRange.yesterday} />
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
      <TabsContent value="thisWeek">
        <AttendanceTable storeKey={storeKeyByDateRange.thisWeek} />
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
      <TabsContent value="thisMonth">
        <AttendanceTable storeKey={storeKeyByDateRange.thisMonth} />
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
      <TabsContent value="all">
        <AttendanceTable storeKey={storeKeyByDateRange.all} />
        <ListPagination className="justify-start mt-2" />
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
        sick: 'border-l-4 border-l-purple-500',
        partial: 'border-l-4 border-l-orange-500',
      };
      return statusColors[record.status] || '';
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col label="Student">
      <StudentName />
    </DataTable.Col>
    <DataTable.Col source="status" label="Status">
      <StatusBadge />
    </DataTable.Col>
    <DataTable.Col source="date" label="Date">
      <DateDisplay />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
    <DataTable.Col source="reason" label="Reason" className="hidden md:table-cell">
      <ReasonText />
    </DataTable.Col>
    <DataTable.Col source="markedBy" label="Marked By" className="hidden lg:table-cell" />
    <DataTable.Col source="source" label="Source" className="hidden lg:table-cell">
      <SourceBadge />
    </DataTable.Col>
  </DataTable>
);

const StudentName = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <ReferenceField reference="students" source="studentId" link={false}>
      <div className="flex flex-col">
        <span className="font-medium">
          <TextField source="firstName" /> <TextField source="lastName" />
        </span>
        <span className="text-xs text-gray-500">
          <TextField source="rollNumber" />
        </span>
      </div>
    </ReferenceField>
  );
};

const StatusBadge = () => {
  const record = useRecordContext();
  if (!record || !record.status) return null;
  
  const statusConfig = {
    present: {
      icon: Check,
      label: 'Present',
      className: 'text-green-700 bg-green-100',
      iconClassName: 'text-green-600'
    },
    absent: {
      icon: X,
      label: 'Absent',
      className: 'text-red-700 bg-red-100',
      iconClassName: 'text-red-600'
    },
    late: {
      icon: Clock,
      label: 'Late',
      className: 'text-yellow-700 bg-yellow-100',
      iconClassName: 'text-yellow-600'
    },
    excused: {
      icon: Shield,
      label: 'Excused',
      className: 'text-blue-700 bg-blue-100',
      iconClassName: 'text-blue-600'
    },
    sick: {
      icon: AlertCircle,
      label: 'Sick',
      className: 'text-purple-700 bg-purple-100',
      iconClassName: 'text-purple-600'
    },
    partial: {
      icon: Clock,
      label: 'Partial',
      className: 'text-orange-700 bg-orange-100',
      iconClassName: 'text-orange-600'
    },
  };
  
  const config = statusConfig[record.status as keyof typeof statusConfig] || statusConfig.present;
  const Icon = config.icon;
  
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${config.iconClassName}`} />
      <Badge className={config.className}>
        {config.label}
      </Badge>
    </div>
  );
};

const DateDisplay = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  // Safe date comparison with null checks
  let isToday = false;
  let isYesterday = false;
  
  if (record.date) {
    try {
      const date = new Date(record.date);
      if (!isNaN(date.getTime())) {
        isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
        isYesterday = format(date, 'yyyy-MM-dd') === format(subDays(new Date(), 1), 'yyyy-MM-dd');
      }
    } catch {
      // Date formatting failed, continue with safe display
    }
  }
  
  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-gray-500" />
      <span className={isToday ? 'font-medium text-blue-600' : isYesterday ? 'text-gray-600' : ''}>
        {formatDate(record.date)}
        {isToday && <span className="ml-2 text-xs text-blue-500">(Today)</span>}
        {isYesterday && <span className="ml-2 text-xs text-gray-500">(Yesterday)</span>}
      </span>
    </div>
  );
};

const ReasonText = () => {
  const record = useRecordContext();
  if (!record || !record.reason) return <span className="text-muted-foreground text-sm">-</span>;
  
  return (
    <span className="text-sm">
      {record.reason}
    </span>
  );
};

const SourceBadge = () => {
  const record = useRecordContext();
  if (!record || !record.source) return null;
  
  const sourceColors = {
    manual: 'text-muted-foreground bg-muted',
    biometric: 'text-green-700 bg-green-100',
    rfid: 'text-blue-700 bg-blue-100',
    mobile_app: 'text-purple-700 bg-purple-100',
    web_portal: 'text-indigo-700 bg-indigo-100',
    import: 'text-orange-700 bg-orange-100',
  };
  
  return (
    <Badge className={sourceColors[record.source as keyof typeof sourceColors] || 'text-muted-foreground bg-muted'}>
      {record.source?.replace('_', ' ')}
    </Badge>
  );
};

export default AttendanceRecordsList;
