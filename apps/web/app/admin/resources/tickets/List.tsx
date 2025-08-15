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
  Count,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Ticket, AlertCircle, Clock, CheckCircle, User, Tag } from "lucide-react";

// Store keys for different status tabs
const storeKeyByStatus = {
  open: "tickets.list.open",
  in_progress: "tickets.list.in_progress",
  resolved: "tickets.list.resolved",
  closed: "tickets.list.closed",
};

// Label-less filters with placeholders
const ticketFilters = [
  <TextInput source="q" placeholder="Search tickets..." label="" alwaysOn />,
  <SelectInput 
    source="category" 
    placeholder="Filter by category" 
    label="" 
    choices={[
      { id: 'technical', name: 'Technical' },
      { id: 'academic', name: 'Academic' },
      { id: 'administrative', name: 'Administrative' },
      { id: 'billing', name: 'Billing' },
      { id: 'general', name: 'General' }
    ]} 
  />,
  <SelectInput 
    source="priority" 
    placeholder="Filter by priority" 
    label="" 
    choices={[
      { id: 'low', name: 'Low' },
      { id: 'medium', name: 'Medium' },
      { id: 'high', name: 'High' },
      { id: 'urgent', name: 'Urgent' }
    ]} 
  />,
  <SelectInput 
    source="ownerType" 
    placeholder="Filter by owner type" 
    label="" 
    choices={[
      { id: 'student', name: 'Student' },
      { id: 'parent', name: 'Parent' },
      { id: 'teacher', name: 'Teacher' },
      { id: 'staff', name: 'Staff' }
    ]} 
  />,
  <ReferenceInput source="assigneeId" reference="staff">
    <AutocompleteInput 
      placeholder="Filter by assignee" 
      label="" 
      optionText={(record) => `${record.firstName} ${record.lastName}`}
    />
  </ReferenceInput>,
];

export const TicketsList = () => (
  <List
    sort={{ field: "createdAt", order: "DESC" }}
    filterDefaultValues={{ status: "open" }}
    filters={ticketFilters}
    perPage={10}
  >
    <TabbedDataTable />
  </List>
);

const TabbedDataTable = () => {
  const listContext = useListContext();
  const { filterValues, setFilters, displayedFilters } = listContext;
  
  const handleChange = (value: string) => () => {
    setFilters({ ...filterValues, status: value }, displayedFilters);
  };
  
  return (
    <Tabs value={filterValues.status ?? "open"}>
      <TabsList>
        <TabsTrigger value="open" onClick={handleChange("open")}>
          Open
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "open" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="in_progress" onClick={handleChange("in_progress")}>
          In Progress
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "in_progress" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="resolved" onClick={handleChange("resolved")}>
          Resolved
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "resolved" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="closed" onClick={handleChange("closed")}>
          Closed
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "closed" }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="open">
        <TicketsTable storeKey={storeKeyByStatus.open} />
      </TabsContent>
      <TabsContent value="in_progress">
        <TicketsTable storeKey={storeKeyByStatus.in_progress} />
      </TabsContent>
      <TabsContent value="resolved">
        <TicketsTable storeKey={storeKeyByStatus.resolved} />
      </TabsContent>
      <TabsContent value="closed">
        <TicketsTable storeKey={storeKeyByStatus.closed} />
      </TabsContent>
    </Tabs>
  );
};

const TicketsTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
    storeKey={storeKey}
    rowClassName={(record) => {
      const statusColors = {
        open: 'border-l-4 border-l-red-500',
        in_progress: 'border-l-4 border-l-yellow-500',
        resolved: 'border-l-4 border-l-green-500',
        closed: 'border-l-4 border-l-gray-400',
      };
      
      const priorityAccent = {
        urgent: ' bg-red-50',
        high: ' bg-orange-50',
        medium: '',
        low: '',
      };
      
      return (statusColors[record.status] || '') + (priorityAccent[record.priority] || '');
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col source="subject" label="Subject">
      <SubjectWithIcon />
    </DataTable.Col>
    <DataTable.Col source="priority" label="Priority">
      <PriorityBadge />
    </DataTable.Col>
    <DataTable.Col source="status" label="Status">
      <StatusBadge />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
    <DataTable.Col source="category" label="Category" className="hidden md:table-cell">
      <CategoryBadge />
    </DataTable.Col>
    <DataTable.Col source="ownerType" label="Owner" className="hidden md:table-cell">
      <OwnerTypeBadge />
    </DataTable.Col>
    <DataTable.Col label="Assignee" className="hidden lg:table-cell">
      <ReferenceField reference="staff" source="assigneeId">
        <TextField source="firstName" />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.Col source="createdAt" label="Created" className="hidden lg:table-cell" />
    <DataTable.Col source="id" label="ID" className="hidden lg:table-cell" />
  </DataTable>
);

const SubjectWithIcon = ({ record }: { record?: any }) => {
  if (!record) return null;
  
  return (
    <div className="flex items-center gap-2">
      <Ticket className="w-4 h-4 text-blue-600" />
      <span className="truncate" title={record.subject}>
        {record.subject}
      </span>
    </div>
  );
};

const PriorityBadge = ({ record }: { record?: any }) => {
  if (!record) return null;
  
  const variants = {
    low: 'secondary',
    medium: 'default',
    high: 'warning',
    urgent: 'destructive',
  } as const;
  
  const colors = {
    low: 'text-gray-700 bg-gray-100',
    medium: 'text-blue-700 bg-blue-100',
    high: 'text-orange-700 bg-orange-100',
    urgent: 'text-red-700 bg-red-100',
  };
  
  const icons = {
    low: null,
    medium: null,
    high: <AlertCircle className="w-3 h-3 mr-1" />,
    urgent: <AlertCircle className="w-3 h-3 mr-1" />,
  };
  
  return (
    <Badge 
      variant={variants[record.priority as keyof typeof variants] || 'default'}
      className={colors[record.priority as keyof typeof colors] || ''}
    >
      {icons[record.priority as keyof typeof icons]}
      {record.priority}
    </Badge>
  );
};

const StatusBadge = ({ record }: { record?: any }) => {
  if (!record) return null;
  
  const variants = {
    open: 'destructive',
    in_progress: 'warning',
    resolved: 'default',
    closed: 'secondary',
  } as const;
  
  const icons = {
    open: <AlertCircle className="w-3 h-3 mr-1" />,
    in_progress: <Clock className="w-3 h-3 mr-1" />,
    resolved: <CheckCircle className="w-3 h-3 mr-1" />,
    closed: <CheckCircle className="w-3 h-3 mr-1" />,
  };
  
  const labels = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };
  
  return (
    <Badge variant={variants[record.status as keyof typeof variants] || 'default'}>
      {icons[record.status as keyof typeof icons]}
      {labels[record.status as keyof typeof labels] || record.status}
    </Badge>
  );
};

const CategoryBadge = ({ record }: { record?: any }) => {
  if (!record || !record.category) return null;
  
  const colors = {
    technical: 'text-purple-700 bg-purple-100',
    academic: 'text-blue-700 bg-blue-100',
    administrative: 'text-green-700 bg-green-100',
    billing: 'text-orange-700 bg-orange-100',
    general: 'text-gray-700 bg-gray-100',
  };
  
  return (
    <div className="flex items-center gap-2">
      <Tag className="w-4 h-4 text-gray-500" />
      <Badge className={colors[record.category as keyof typeof colors] || 'text-gray-700 bg-gray-100'}>
        {record.category}
      </Badge>
    </div>
  );
};

const OwnerTypeBadge = ({ record }: { record?: any }) => {
  if (!record || !record.ownerType) return null;
  
  const colors = {
    student: 'text-blue-700 bg-blue-100',
    parent: 'text-green-700 bg-green-100',
    teacher: 'text-purple-700 bg-purple-100',
    staff: 'text-orange-700 bg-orange-100',
  };
  
  return (
    <div className="flex items-center gap-2">
      <User className="w-4 h-4 text-gray-500" />
      <Badge className={colors[record.ownerType as keyof typeof colors] || 'text-gray-700 bg-gray-100'}>
        {record.ownerType}
      </Badge>
    </div>
  );
};

export default TicketsList;