"use client";

<<<<<<< HEAD
import { useListContext, useRecordContext } from "ra-core";
import {
  DataTable,
  List,
  Count,
  TextInput,
  SelectInput,
=======
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
>>>>>>> origin/main
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Send, Clock, CheckCircle } from "lucide-react";
<<<<<<< HEAD
import { formatDate, formatDateTime } from "@/lib/utils/date-utils";
=======
>>>>>>> origin/main

// Store keys for different status tabs
const storeKeyByStatus = {
  draft: "campaigns.list.draft",
  scheduled: "campaigns.list.scheduled",
  running: "campaigns.list.running",
  completed: "campaigns.list.completed",
  paused: "campaigns.list.paused",
};

<<<<<<< HEAD
const filters = [
  <TextInput source="q" placeholder="Search..." label="" alwaysOn />,
  <SelectInput 
    source="status" 
    placeholder="Filter by status..." 
=======
// Label-less filters with placeholders
const campaignFilters = [
  <TextInput source="q" placeholder="Search campaigns..." label="" alwaysOn />,
  <ReferenceInput source="templateId" reference="templates">
    <AutocompleteInput placeholder="Filter by template" label="" optionText="name" />
  </ReferenceInput>,
  <SelectInput 
    source="status" 
    placeholder="Filter by status" 
>>>>>>> origin/main
    label="" 
    choices={[
      { id: 'draft', name: 'Draft' },
      { id: 'scheduled', name: 'Scheduled' },
      { id: 'running', name: 'Running' },
      { id: 'completed', name: 'Completed' },
<<<<<<< HEAD
      { id: 'paused', name: 'Paused' },
    ]} 
  />,
  <TextInput source="schedule_gte" placeholder="Scheduled after (YYYY-MM-DD)..." label="" />,
=======
      { id: 'paused', name: 'Paused' }
    ]} 
  />,
  <DateInput source="schedule_gte" placeholder="Scheduled after" label="" />,
>>>>>>> origin/main
];

export const CampaignsList = () => (
  <List
<<<<<<< HEAD
    filters={filters}
    sort={{ field: "createdAt", order: "DESC" }}
    filterDefaultValues={{ status: "draft" }}
=======
    sort={{ field: "createdAt", order: "DESC" }}
    filterDefaultValues={{ status: "draft" }}
    filters={campaignFilters}
>>>>>>> origin/main
    perPage={10}
  >
    <TabbedDataTable />
  </List>
);

<<<<<<< HEAD

=======
>>>>>>> origin/main
const TabbedDataTable = () => {
  const listContext = useListContext();
  const { filterValues, setFilters, displayedFilters } = listContext;
  
  const handleChange = (value: string) => () => {
    setFilters({ ...filterValues, status: value }, displayedFilters);
  };
  
  return (
    <Tabs value={filterValues.status ?? "draft"}>
      <TabsList>
        <TabsTrigger value="draft" onClick={handleChange("draft")}>
          Draft
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "draft" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="scheduled" onClick={handleChange("scheduled")}>
          Scheduled
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "scheduled" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="running" onClick={handleChange("running")}>
          Running
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "running" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="completed" onClick={handleChange("completed")}>
          Completed
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "completed" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="paused" onClick={handleChange("paused")}>
          Paused
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "paused" }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="draft">
        <CampaignsTable storeKey={storeKeyByStatus.draft} />
      </TabsContent>
      <TabsContent value="scheduled">
        <CampaignsTable storeKey={storeKeyByStatus.scheduled} />
      </TabsContent>
      <TabsContent value="running">
        <CampaignsTable storeKey={storeKeyByStatus.running} />
      </TabsContent>
      <TabsContent value="completed">
        <CampaignsTable storeKey={storeKeyByStatus.completed} />
      </TabsContent>
      <TabsContent value="paused">
        <CampaignsTable storeKey={storeKeyByStatus.paused} />
      </TabsContent>
    </Tabs>
  );
};

const CampaignsTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
    storeKey={storeKey}
    rowClassName={(record) => {
      const statusColors = {
        draft: 'border-l-4 border-l-gray-400',
        scheduled: 'border-l-4 border-l-blue-500',
        running: 'border-l-4 border-l-green-500',
        completed: 'border-l-4 border-l-purple-500',
        paused: 'border-l-4 border-l-yellow-500',
      };
      return statusColors[record.status] || '';
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col source="name" label="Campaign Name" />
    <DataTable.Col source="status" label="Status">
      <StatusBadge />
    </DataTable.Col>
    <DataTable.Col source="schedule" label="Schedule">
      <ScheduleBadge />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
    <DataTable.Col label="Template" className="hidden md:table-cell">
<<<<<<< HEAD
      <TemplateField />
    </DataTable.Col>
    <DataTable.Col source="createdAt" label="Created" className="hidden lg:table-cell">
      <CreatedDateField />
    </DataTable.Col>
  </DataTable>
);

const StatusBadge = () => {
  const record = useRecordContext();
=======
      <ReferenceField reference="templates" source="templateId">
        <TextField source="name" />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.Col source="createdAt" label="Created" className="hidden lg:table-cell" />
    <DataTable.Col source="id" label="ID" className="hidden lg:table-cell" />
  </DataTable>
);

const StatusBadge = ({ record }: { record?: any }) => {
>>>>>>> origin/main
  if (!record) return null;
  
  const variants = {
    draft: 'secondary',
    scheduled: 'default',
    running: 'default',
    completed: 'default',
    paused: 'warning',
  } as const;
  
  const icons = {
    draft: <Clock className="w-4 h-4 mr-1" />,
    scheduled: <Calendar className="w-4 h-4 mr-1" />,
    running: <Send className="w-4 h-4 mr-1" />,
    completed: <CheckCircle className="w-4 h-4 mr-1" />,
    paused: <Clock className="w-4 h-4 mr-1" />,
  };
  
  const colors = {
    draft: 'text-gray-700 bg-gray-100',
    scheduled: 'text-blue-700 bg-blue-100',
    running: 'text-green-700 bg-green-100',
    completed: 'text-purple-700 bg-purple-100',
    paused: 'text-yellow-700 bg-yellow-100',
  };
  
  return (
    <Badge 
      variant={variants[record.status as keyof typeof variants] || 'default'}
      className={colors[record.status as keyof typeof colors] || ''}
    >
      {icons[record.status as keyof typeof icons]}
      {record.status}
    </Badge>
  );
};

<<<<<<< HEAD
const CreatedDateField = () => {
  const record = useRecordContext();
  if (!record || !record.createdAt) return null;
  return <span>{formatDate(record.createdAt)}</span>;
};

const TemplateField = () => {
  const record = useRecordContext();
  if (!record || !record.templateId) return <span className="text-muted-foreground">-</span>;
  
  // Handle case where template data might not be loaded
  if (record.template) {
    return <span>{record.template.name}</span>;
  }
  
  return <span className="text-xs text-muted-foreground">ID: {record.templateId}</span>;
};

const ScheduleBadge = () => {
  const record = useRecordContext();
=======
const ScheduleBadge = ({ record }: { record?: any }) => {
>>>>>>> origin/main
  if (!record || !record.schedule) return null;
  
  const scheduleDate = new Date(record.schedule);
  const now = new Date();
  
<<<<<<< HEAD
  // Handle invalid dates
  if (isNaN(scheduleDate.getTime())) {
    return (
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-600" />
        <Badge className="text-gray-700 bg-gray-100">Invalid date</Badge>
      </div>
    );
  }
  
=======
>>>>>>> origin/main
  const getScheduleColor = () => {
    if (scheduleDate < now) return 'text-gray-700 bg-gray-100';
    const diffHours = (scheduleDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours <= 24) return 'text-red-700 bg-red-100';
    if (diffHours <= 72) return 'text-yellow-700 bg-yellow-100';
    return 'text-green-700 bg-green-100';
  };
  
  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-blue-600" />
      <Badge className={getScheduleColor()}>
<<<<<<< HEAD
        {formatDateTime(record.schedule)}
=======
        {scheduleDate.toLocaleDateString()} {scheduleDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
>>>>>>> origin/main
      </Badge>
    </div>
  );
};

export default CampaignsList;