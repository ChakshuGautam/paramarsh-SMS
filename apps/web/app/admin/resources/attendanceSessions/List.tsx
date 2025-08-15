"use client";

import { useListContext, useRecordContext } from "ra-core";
import {
  DataTable,
  List,
  ReferenceField,
  TextField,
  DateInput,
  SelectInput,
  Count,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, Clock, Users, BookOpen, CheckCircle, Play } from "lucide-react";
import { useRouter } from "next/navigation";

// Store keys for different session states
const storeKeyByStatus = {
  scheduled: "attendanceSessions.list.scheduled",
  inProgress: "attendanceSessions.list.inProgress", 
  completed: "attendanceSessions.list.completed",
  all: "attendanceSessions.list.all",
};

// Filters
const sessionFilters = [
  <DateInput source="date" placeholder="Filter by date" label="" />,
  <SelectInput 
    source="status" 
    placeholder="Filter by status" 
    label="" 
    choices={[
      { id: 'scheduled', name: 'Scheduled' },
      { id: 'in-progress', name: 'In Progress' },
      { id: 'completed', name: 'Completed' },
      { id: 'cancelled', name: 'Cancelled' },
    ]} 
  />,
];

export const AttendanceSessionsList = () => (
  <List
    sort={{ field: "date", order: "DESC" }}
    filters={sessionFilters}
    perPage={10}
  >
    <TabbedDataTable />
  </List>
);

const TabbedDataTable = () => {
  const listContext = useListContext();
  const { filterValues, setFilters, displayedFilters } = listContext;
  
  const handleChange = (status: string) => () => {
    const newFilters = { ...filterValues };
    if (status === 'all') {
      delete newFilters.status;
    } else {
      newFilters.status = status;
    }
    setFilters(newFilters, displayedFilters);
  };
  
  const getCurrentTab = () => {
    if (filterValues.status === 'scheduled') return 'scheduled';
    if (filterValues.status === 'in-progress') return 'inProgress';
    if (filterValues.status === 'completed') return 'completed';
    return 'all';
  };
  
  return (
    <Tabs value={getCurrentTab()}>
      <TabsList>
        <TabsTrigger value="scheduled" onClick={handleChange('scheduled')}>
          <Clock className="w-4 h-4 mr-2" />
          Scheduled
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: 'scheduled' }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="inProgress" onClick={handleChange('in-progress')}>
          <Play className="w-4 h-4 mr-2" />
          In Progress
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: 'in-progress' }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="completed" onClick={handleChange('completed')}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Completed
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: 'completed' }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="all" onClick={handleChange('all')}>
          All Sessions
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="scheduled">
        <SessionsTable storeKey={storeKeyByStatus.scheduled} />
      </TabsContent>
      <TabsContent value="inProgress">
        <SessionsTable storeKey={storeKeyByStatus.inProgress} />
      </TabsContent>
      <TabsContent value="completed">
        <SessionsTable storeKey={storeKeyByStatus.completed} />
      </TabsContent>
      <TabsContent value="all">
        <SessionsTable storeKey={storeKeyByStatus.all} />
      </TabsContent>
    </Tabs>
  );
};

const SessionsTable = ({ storeKey }: { storeKey: string }) => {
  return (
    <DataTable 
      storeKey={storeKey}
      rowClassName={(record) => {
        const statusColors = {
          'scheduled': 'border-l-4 border-l-gray-400',
          'in-progress': 'border-l-4 border-l-blue-500',
          'completed': 'border-l-4 border-l-green-500',
          'cancelled': 'border-l-4 border-l-red-500',
        };
        return statusColors[record.status as keyof typeof statusColors] || '';
      }}
    >
      <DataTable.Col source="date" label="Date">
        <DateDisplay />
      </DataTable.Col>
      <DataTable.Col label="Period">
        <PeriodInfo />
      </DataTable.Col>
      <DataTable.Col label="Class & Section">
        <SectionDisplay />
      </DataTable.Col>
      <DataTable.Col label="Subject">
        <SubjectDisplay />
      </DataTable.Col>
      <DataTable.Col label="Teacher">
        <TeacherDisplay />
      </DataTable.Col>
      <DataTable.Col source="status" label="Status">
        <StatusBadge />
      </DataTable.Col>
      <DataTable.Col label="Students" className="text-center">
        <AttendanceStats />
      </DataTable.Col>
      <DataTable.Col label="Actions">
        <ActionButtons />
      </DataTable.Col>
    </DataTable>
  );
};

const DateDisplay = () => {
  const record = useRecordContext();
  if (!record || !record.date) return null;
  
  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-gray-500" />
      <span>{format(new Date(record.date), 'MMM dd, yyyy')}</span>
    </div>
  );
};

const PeriodInfo = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-gray-500" />
      <span className="font-medium">
        {record.period?.timeSlot?.name || 'N/A'}
      </span>
    </div>
  );
};

const SectionDisplay = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <ReferenceField reference="sections" source="sectionId" link={false}>
      <div className="flex flex-col">
        <span className="font-medium">
          <TextField source="class.name" /> - <TextField source="name" />
        </span>
      </div>
    </ReferenceField>
  );
};

const SubjectDisplay = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <div className="flex items-center gap-2">
      <BookOpen className="w-4 h-4 text-gray-500" />
      <ReferenceField reference="subjects" source="subjectId" link={false}>
        <TextField source="name" />
      </ReferenceField>
    </div>
  );
};

const TeacherDisplay = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <div className="flex flex-col">
      <ReferenceField reference="teachers" source="assignedTeacherId" link={false}>
        <span className="text-sm">
          <TextField source="staff.firstName" /> <TextField source="staff.lastName" />
        </span>
      </ReferenceField>
      {record.actualTeacherId && record.actualTeacherId !== record.assignedTeacherId && (
        <span className="text-xs text-orange-600">(Substitute)</span>
      )}
    </div>
  );
};

const StatusBadge = () => {
  const record = useRecordContext();
  if (!record || !record.status) return null;
  
  const statusConfig = {
    'scheduled': { color: 'bg-gray-100 text-gray-700', icon: Clock },
    'in-progress': { color: 'bg-blue-100 text-blue-700', icon: Play },
    'completed': { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    'cancelled': { color: 'bg-red-100 text-red-700', icon: null },
  };
  
  const config = statusConfig[record.status as keyof typeof statusConfig];
  
  return (
    <Badge className={config?.color}>
      {record.status.replace('-', ' ')}
    </Badge>
  );
};

const AttendanceStats = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  const markedCount = record._count?.studentRecords || 0;
  const totalCount = record.section?.enrollments?.length || 0;
  
  return (
    <div className="text-center">
      <span className="font-medium">{markedCount}</span>
      <span className="text-gray-500"> / {totalCount}</span>
      {markedCount > 0 && totalCount > 0 && (
        <div className="text-xs text-gray-500">
          {Math.round((markedCount / totalCount) * 100)}%
        </div>
      )}
    </div>
  );
};

const ActionButtons = () => {
  const record = useRecordContext();
  const router = useRouter();
  
  if (!record) return null;
  
  const handleMarkAttendance = () => {
    router.push(`/admin#/attendanceSessions/${record.id}`);
  };
  
  const handleView = () => {
    router.push(`/admin#/attendanceSessions/${record.id}/show`);
  };
  
  return (
    <div className="flex gap-2">
      {record.status !== 'completed' && (
        <Button size="sm" onClick={handleMarkAttendance}>
          Mark Attendance
        </Button>
      )}
      {record.status === 'completed' && (
        <Button size="sm" variant="outline" onClick={handleView}>
          View
        </Button>
      )}
    </div>
  );
};

export default AttendanceSessionsList;