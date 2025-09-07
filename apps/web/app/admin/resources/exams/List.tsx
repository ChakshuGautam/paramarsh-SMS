"use client";

import { useEffect, useState } from "react";
import { useListContext, useRecordContext, useDataProvider } from "ra-core";
import {
  DataTable,
  List,
  ReferenceField,
  Count,
  TextField,
  TextInput,
  SelectInput,
  ListPagination,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, isBefore, isWithinInterval } from "date-fns";
import { 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  FileText, 
  ClipboardCheck,
  Percent,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  Download,
  Eye,
  Send,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRedirect } from "ra-core";

// Store keys for different time periods
const storeKeyByPeriod = {
  upcoming: "exams.list.upcoming",
  ongoing: "exams.list.ongoing",
  completed: "exams.list.completed",
  all: "exams.list.all",
};

// Helper function to get time period filters
const getTimeFilter = (period: string) => {
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  
  switch (period) {
    case "upcoming":
      return { startDate_gt: todayStr };
    case "ongoing":
      return { startDate_lte: todayStr, endDate_gte: todayStr };
    case "completed":
      return { endDate_lt: todayStr };
    default:
      return {};
  }
};

// Standardized filters using filter components
const examFilters = [
  <TextInput source="q" placeholder="Search exams..." label="" alwaysOn />,
  <SelectInput 
    source="academicYearId" 
    placeholder="Filter by academic year" 
    label=""
    choices={[]} // Would need to be populated with academic year data
  />,
  <SelectInput
    source="examType"
    placeholder="Filter by exam type"
    label=""
    choices={[
      { id: 'UNIT_TEST', name: 'Unit Test' },
      { id: 'MONTHLY_TEST', name: 'Monthly Test' },
      { id: 'QUARTERLY', name: 'Quarterly Exam' },
      { id: 'HALF_YEARLY', name: 'Half Yearly' },
      { id: 'ANNUAL', name: 'Annual/Final' },
      { id: 'BOARD_EXAM', name: 'Board Exam' },
      { id: 'ENTRANCE_EXAM', name: 'Entrance Exam' },
      { id: 'MOCK_TEST', name: 'Mock Test' },
      { id: 'REMEDIAL_TEST', name: 'Remedial Test' },
      { id: 'SURPRISE_TEST', name: 'Surprise Test' },
    ]}
  />,
];

export const ExamsList = () => {
  const [currentAcademicYear, setCurrentAcademicYear] = useState<string | null>(null);
  const dataProvider = useDataProvider();
  
  useEffect(() => {
    // Fetch the current active academic year
    dataProvider.getList('academicYears', {
      filter: { isActive: true },
      pagination: { page: 1, perPage: 1 },
      sort: { field: 'name', order: 'DESC' },
    }).then(({ data }) => {
      if (data && data.length > 0) {
        setCurrentAcademicYear(data[0].id);
      }
    }).catch(error => {
      console.error('Error fetching current academic year:', error);
    });
  }, [dataProvider]);
  
  // Set default filter to show current academic year's exams
  const defaultFilter = currentAcademicYear ? {
    academicYearId: currentAcademicYear
  } : {};
  
  return (
    <List
      sort={{ field: "startDate", order: "ASC" }}
      filters={examFilters}
      filterDefaultValues={defaultFilter}
      perPage={10}
      pagination={false}
    >
      <TabbedDataTable />
    </List>
  );
};

const TabbedDataTable = () => {
  const listContext = useListContext();
  const { filterValues, setFilters, displayedFilters } = listContext;
  
  const handleChange = (value: string) => () => {
    const timeFilter = getTimeFilter(value);
    setFilters({ ...filterValues, ...timeFilter }, displayedFilters);
  };
  
  // Determine current tab based on filter values
  const getCurrentTab = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    
    if (filterValues.startDate_gt === today) return "upcoming";
    if (filterValues.startDate_lte === today && filterValues.endDate_gte === today) return "ongoing";
    if (filterValues.endDate_lt === today) return "completed";
    return "all";
  };
  
  return (
    <Tabs value={getCurrentTab()}>
      <TabsList>
        <TabsTrigger value="upcoming" onClick={handleChange("upcoming")}>
          Upcoming
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getTimeFilter("upcoming") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="ongoing" onClick={handleChange("ongoing")}>
          Ongoing
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getTimeFilter("ongoing") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="completed" onClick={handleChange("completed")}>
          Completed
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getTimeFilter("completed") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="all" onClick={handleChange("all")}>
          All Exams
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getTimeFilter("all") }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming">
        <ExamsTable storeKey={storeKeyByPeriod.upcoming} />
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
      <TabsContent value="ongoing">
        <ExamsTable storeKey={storeKeyByPeriod.ongoing} />
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
      <TabsContent value="completed">
        <ExamsTable storeKey={storeKeyByPeriod.completed} />
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
      <TabsContent value="all">
        <ExamsTable storeKey={storeKeyByPeriod.all} />
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
    </Tabs>
  );
};

const ExamsTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
    storeKey={storeKey}
    rowClassName={(record) => {
      const today = new Date();
      const startDate = new Date(record.startDate);
      const endDate = new Date(record.endDate);
      
      if (isAfter(startDate, today)) {
        return 'border-l-4 border-l-blue-500'; // upcoming
      } else if (isWithinInterval(today, { start: startDate, end: endDate })) {
        return 'border-l-4 border-l-green-500'; // ongoing
      } else {
        return 'border-l-4 border-l-gray-400'; // completed
      }
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col source="name" label="Exam Name" />
    <DataTable.Col source="examType" label="Type">
      <ExamTypeBadge />
    </DataTable.Col>
    <DataTable.Col label="Days Remaining">
      <DaysRemaining />
    </DataTable.Col>
    <DataTable.Col label="Readiness">
      <ReadinessStatus />
    </DataTable.Col>
    <DataTable.Col source="startDate" label="Start Date">
      <DateBadge source="startDate" />
    </DataTable.Col>
    <DataTable.Col source="endDate" label="End Date" className="hidden md:table-cell">
      <DateBadge source="endDate" />
    </DataTable.Col>
    <DataTable.Col source="status" label="Status" className="hidden lg:table-cell">
      <StatusBadge />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
    <DataTable.Col source="term" label="Term" className="hidden xl:table-cell">
      <TermDisplay />
    </DataTable.Col>
    <DataTable.Col source="weightagePercent" label="Weightage" className="hidden xl:table-cell">
      <WeightageDisplay />
    </DataTable.Col>
    <DataTable.Col source="maxMarks" label="Max Marks" className="hidden xl:table-cell">
      <TextField source="maxMarks" />
    </DataTable.Col>
    <DataTable.Col label="Actions" className="hidden md:table-cell">
      <ExamActions />
    </DataTable.Col>
  </DataTable>
);

const DateBadge = ({ record, source }: { record?: any; source: string }) => {
  if (!record || !record[source]) return null;
  
  const date = new Date(record[source]);
  const today = new Date();
  
  const getDateColor = () => {
    if (isAfter(date, today)) return 'text-blue-700 bg-blue-100';
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) return 'text-green-700 bg-green-100';
    return 'text-gray-700 bg-gray-100';
  };
  
  return (
    <Badge className={getDateColor()}>
      {format(date, 'MMM dd, yyyy')}
    </Badge>
  );
};

const ExamTypeBadge = () => {
  const record = useRecordContext();
  if (!record?.examType) return <span className="text-muted-foreground">-</span>;
  
  const typeConfig: Record<string, { label: string; color: string; icon: any }> = {
    UNIT_TEST: { label: 'Unit Test', color: 'bg-blue-100 text-blue-700', icon: FileText },
    MONTHLY_TEST: { label: 'Monthly', color: 'bg-purple-100 text-purple-700', icon: Calendar },
    QUARTERLY: { label: 'Quarterly', color: 'bg-indigo-100 text-indigo-700', icon: BookOpen },
    HALF_YEARLY: { label: 'Half Yearly', color: 'bg-orange-100 text-orange-700', icon: ClipboardCheck },
    ANNUAL: { label: 'Annual', color: 'bg-red-100 text-red-700', icon: GraduationCap },
    BOARD_EXAM: { label: 'Board', color: 'bg-yellow-100 text-yellow-700', icon: GraduationCap },
    ENTRANCE_EXAM: { label: 'Entrance', color: 'bg-green-100 text-green-700', icon: GraduationCap },
    MOCK_TEST: { label: 'Mock', color: 'bg-gray-100 text-gray-700', icon: FileText },
    REMEDIAL_TEST: { label: 'Remedial', color: 'bg-pink-100 text-pink-700', icon: BookOpen },
    SURPRISE_TEST: { label: 'Surprise', color: 'bg-cyan-100 text-cyan-700', icon: FileText },
  };
  
  const config = typeConfig[record.examType] || { label: record.examType, color: 'bg-gray-100 text-gray-700', icon: FileText };
  const Icon = config.icon;
  
  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
};

const StatusBadge = () => {
  const record = useRecordContext();
  if (!record?.status) return <span className="text-muted-foreground">-</span>;
  
  const statusConfig: Record<string, { label: string; color: string }> = {
    SCHEDULED: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
    ONGOING: { label: 'Ongoing', color: 'bg-green-100 text-green-700' },
    COMPLETED: { label: 'Completed', color: 'bg-gray-100 text-gray-700' },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
    POSTPONED: { label: 'Postponed', color: 'bg-yellow-100 text-yellow-700' },
  };
  
  const config = statusConfig[record.status] || { label: record.status, color: 'bg-gray-100 text-gray-700' };
  
  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  );
};

const TermDisplay = () => {
  const record = useRecordContext();
  if (!record?.term) return <span className="text-muted-foreground">-</span>;
  
  const termLabels: Record<number, string> = {
    1: 'Term 1',
    2: 'Term 2',
    3: 'Term 3',
  };
  
  return (
    <Badge variant="outline">
      {termLabels[record.term] || `Term ${record.term}`}
    </Badge>
  );
};

const WeightageDisplay = () => {
  const record = useRecordContext();
  if (record?.weightagePercent === undefined || record?.weightagePercent === null) {
    return <span className="text-muted-foreground">-</span>;
  }
  
  return (
    <div className="flex items-center gap-1">
      <Percent className="h-3 w-3 text-muted-foreground" />
      <span className="font-medium">{record.weightagePercent}%</span>
    </div>
  );
};

const DaysRemaining = () => {
  const record = useRecordContext();
  if (!record?.startDate) return <span className="text-muted-foreground">-</span>;
  
  const today = new Date();
  const startDate = new Date(record.startDate);
  const endDate = new Date(record.endDate);
  
  // Calculate days remaining
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / msPerDay);
  const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / msPerDay);
  
  if (daysUntilStart > 0) {
    // Exam hasn't started yet
    const urgencyColor = daysUntilStart <= 3 ? 'text-red-700 bg-red-100' : 
                        daysUntilStart <= 7 ? 'text-orange-700 bg-orange-100' : 
                        'text-blue-700 bg-blue-100';
    
    return (
      <Badge className={`${urgencyColor} flex items-center gap-1`}>
        <Clock className="h-3 w-3" />
        {daysUntilStart} day{daysUntilStart !== 1 ? 's' : ''}
      </Badge>
    );
  } else if (daysUntilEnd >= 0) {
    // Exam is ongoing
    return (
      <Badge className="text-green-700 bg-green-100 flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Ongoing
      </Badge>
    );
  } else {
    // Exam has ended
    return (
      <Badge variant="secondary">
        Completed
      </Badge>
    );
  }
};

const ReadinessStatus = () => {
  const record = useRecordContext();
  if (!record) return <span className="text-muted-foreground">-</span>;
  
  // This would typically check various factors like:
  // - Question papers prepared
  // - Seating arrangements done
  // - Invigilators assigned
  // - Hall tickets generated
  // For now, we'll simulate based on days remaining
  
  const today = new Date();
  const startDate = new Date(record.startDate);
  const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  
  if (daysUntilStart < 0) {
    // Exam has passed
    return (
      <Badge variant="secondary">
        N/A
      </Badge>
    );
  }
  
  // Simulate readiness based on days remaining
  const readiness = daysUntilStart > 7 ? 'ready' : 
                    daysUntilStart > 3 ? 'partial' : 
                    'not-ready';
  
  const readinessConfig = {
    'ready': {
      label: 'Ready',
      color: 'text-green-700 bg-green-100',
      icon: CheckCircle2
    },
    'partial': {
      label: 'In Progress',
      color: 'text-orange-700 bg-orange-100',
      icon: AlertCircle
    },
    'not-ready': {
      label: 'Not Ready',
      color: 'text-red-700 bg-red-100',
      icon: AlertCircle
    }
  };
  
  const config = readinessConfig[readiness];
  const Icon = config.icon;
  
  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

const ExamActions = () => {
  const record = useRecordContext();
  const redirect = useRedirect();
  
  if (!record) return null;
  
  const handleViewDateSheet = () => {
    // Navigate to date sheet view for this exam
    redirect(`/admin/exams/${record.id}/datesheet`);
  };
  
  const handleGenerateDateSheet = () => {
    // This would typically generate a PDF or printable date sheet
    // For now, we'll simulate by opening a date sheet view
    console.log('Generating date sheet for exam:', record.name);
    // In a real app, this would call a backend API to generate PDF
    alert(`Date sheet generation for "${record.name}" would be triggered here`);
  };
  
  const handleShareMarks = () => {
    // This would typically trigger an API call to send marks to parents
    // via email/SMS/app notification
    console.log('Sharing marks for exam:', record.name);
    alert(`Mark sharing for "${record.name}" would be triggered here. Parents would receive marks via SMS/Email.`);
  };
  
  // Check if exam is completed to show marks sharing button
  const today = new Date();
  const endDate = new Date(record.endDate);
  const isCompleted = endDate < today;
  
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleViewDateSheet}
        title="View Date Sheet"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleGenerateDateSheet}
        title="Generate Date Sheet"
      >
        <CalendarDays className="h-4 w-4" />
      </Button>
      {isCompleted && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleShareMarks}
          title="Notify/Share Marks to Parents"
          className="text-blue-600 hover:text-blue-700"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ExamsList;
