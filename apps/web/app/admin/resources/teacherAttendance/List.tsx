"use client";

import { useListContext, useRecordContext } from "ra-core";
import {
  DataTable,
  List,
  ReferenceField,
  TextField,
  Count,
  TextInput,
  SelectInput,
  ListPagination,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";
import { Check, X, Clock, AlertCircle, LogIn, LogOut, Calendar } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

// Store keys for different date ranges
const storeKeyByDateRange = {
  today: "teacherAttendance.list.today",
  yesterday: "teacherAttendance.list.yesterday",
  thisWeek: "teacherAttendance.list.thisWeek",
  thisMonth: "teacherAttendance.list.thisMonth",
  all: "teacherAttendance.list.all",
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

const filters = [
  <TextInput source="q" placeholder="Search..." label="" alwaysOn />,
  <SelectInput 
    source="status" 
    placeholder="Filter by status..." 
    label="" 
    choices={[
      { id: 'PRESENT', name: 'Present' },
      { id: 'ABSENT', name: 'Absent' },
      { id: 'LATE', name: 'Late' },
      { id: 'HALF_DAY', name: 'Half Day' },
      { id: 'ON_LEAVE', name: 'On Leave' },
    ]} 
  />,
  <TextInput source="date" placeholder="Filter by date (YYYY-MM-DD)..." label="" />,
];

export const TeacherAttendanceList = () => (
  <List
    filters={filters}
    sort={{ field: "date", order: "DESC" }}
    filterDefaultValues={{ ...getDateFilter("today") }}
    perPage={10}
    pagination={false}
    resource="teacher-attendance"
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
        <TeacherAttendanceTable storeKey={storeKeyByDateRange.today} />
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
      <TabsContent value="yesterday">
        <TeacherAttendanceTable storeKey={storeKeyByDateRange.yesterday} />
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
      <TabsContent value="thisWeek">
        <TeacherAttendanceTable storeKey={storeKeyByDateRange.thisWeek} />
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
      <TabsContent value="thisMonth">
        <TeacherAttendanceTable storeKey={storeKeyByDateRange.thisMonth} />
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
      <TabsContent value="all">
        <TeacherAttendanceTable storeKey={storeKeyByDateRange.all} />
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
    </Tabs>
  );
};

const TeacherAttendanceTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
      storeKey={storeKey}
      rowClassName={(record) => {
        const statusColors = {
          PRESENT: 'border-l-4 border-l-green-500',
          ABSENT: 'border-l-4 border-l-red-500',
          LATE: 'border-l-4 border-l-yellow-500',
          HALF_DAY: 'border-l-4 border-l-orange-500',
          ON_LEAVE: 'border-l-4 border-l-blue-500',
        };
        return statusColors[record.status] || '';
      }}
    >
      {/* Always visible columns */}
      <DataTable.Col label="Teacher">
        <TeacherName />
      </DataTable.Col>
      <DataTable.Col source="status" label="Status">
        <StatusBadge />
      </DataTable.Col>
      <DataTable.Col source="date" label="Date">
        <DateDisplay />
      </DataTable.Col>
      
      {/* Desktop-only columns */}
      <DataTable.Col label="Check In" className="hidden md:table-cell">
        <CheckInTime />
      </DataTable.Col>
      <DataTable.Col label="Check Out" className="hidden md:table-cell">
        <CheckOutTime />
      </DataTable.Col>
      <DataTable.Col label="Total Hours" className="hidden lg:table-cell">
        <TotalHours />
      </DataTable.Col>
    </DataTable>
);

const TeacherName = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <ReferenceField reference="teachers" source="teacherId" link={false}>
      <div className="flex flex-col">
        <span className="font-medium">
          <TextField source="staff.firstName" /> <TextField source="staff.lastName" />
        </span>
        <span className="text-xs text-gray-500">
          <TextField source="staffId" />
        </span>
      </div>
    </ReferenceField>
  );
};

const StatusBadge = () => {
  const record = useRecordContext();
  if (!record || !record.status) return null;
  
  const statusConfig = {
    PRESENT: {
      icon: Check,
      label: 'Present',
      className: 'text-green-700 bg-green-100',
      iconClassName: 'text-green-600'
    },
    ABSENT: {
      icon: X,
      label: 'Absent',
      className: 'text-red-700 bg-red-100',
      iconClassName: 'text-red-600'
    },
    LATE: {
      icon: Clock,
      label: 'Late',
      className: 'text-yellow-700 bg-yellow-100',
      iconClassName: 'text-yellow-600'
    },
    HALF_DAY: {
      icon: AlertCircle,
      label: 'Half Day',
      className: 'text-orange-700 bg-orange-100',
      iconClassName: 'text-orange-600'
    },
    ON_LEAVE: {
      icon: AlertCircle,
      label: 'Leave',
      className: 'text-blue-700 bg-blue-100',
      iconClassName: 'text-blue-600'
    },
  };
  
  const config = statusConfig[record.status as keyof typeof statusConfig] || statusConfig.PRESENT;
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

const CheckInTime = () => {
  const record = useRecordContext();
  if (!record || !record.checkIn) return <span className="text-muted-foreground text-sm">-</span>;
  
  return (
    <div className="flex items-center gap-2">
      <LogIn className="w-4 h-4 text-green-600" />
      <span className="text-sm">
        {formatTime(record.checkIn)}
      </span>
    </div>
  );
};

const CheckOutTime = () => {
  const record = useRecordContext();
  if (!record || !record.checkOut) return <span className="text-muted-foreground text-sm">-</span>;
  
  return (
    <div className="flex items-center gap-2">
      <LogOut className="w-4 h-4 text-red-600" />
      <span className="text-sm">
        {formatTime(record.checkOut)}
      </span>
    </div>
  );
};

const TotalHours = () => {
  const record = useRecordContext();
  if (!record || !record.totalHours) return <span className="text-muted-foreground text-sm">-</span>;
  
  const hours = Math.floor(record.totalHours);
  const minutes = Math.round((record.totalHours % 1) * 60);
  
  return (
    <span className="text-sm font-medium">
      {hours}h {minutes}m
    </span>
  );
};

export default TeacherAttendanceList;