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
  DateRangeInput,
  Count,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Store keys for different status tabs
const storeKeyByStatus = {
  active: "enrollments.list.active",
  inactive: "enrollments.list.inactive",
  transferred: "enrollments.list.transferred",
  graduated: "enrollments.list.graduated",
  dropped: "enrollments.list.dropped",
};

// Label-less filters with placeholders
const enrollmentFilters = [
  <TextInput source="q" placeholder="Search enrollments..." label="" alwaysOn />,
  <ReferenceInput source="studentId" reference="students">
    <AutocompleteInput 
      placeholder="Filter by student" 
      label="" 
      optionText={(record) => `${record.firstName} ${record.lastName}`}
    />
  </ReferenceInput>,
  <ReferenceInput source="sectionId" reference="sections">
    <AutocompleteInput placeholder="Filter by section" label="" optionText="name" />
  </ReferenceInput>,
  <DateRangeInput 
    source="enrollment"
    sourceFrom="startDate_gte"
    sourceTo="endDate_lte"
    label=""
    placeholder="Select enrollment period"
  />,
];

export const EnrollmentsList = () => (
  <List
    sort={{ field: "startDate", order: "DESC" }}
    filterDefaultValues={{ status: "active" }}
    filters={enrollmentFilters}
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
    <Tabs value={filterValues.status ?? "active"}>
      <TabsList>
        <TabsTrigger value="active" onClick={handleChange("active")}>
          Active
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "active" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="inactive" onClick={handleChange("inactive")}>
          Inactive
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "inactive" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="transferred" onClick={handleChange("transferred")}>
          Transferred
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "transferred" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="graduated" onClick={handleChange("graduated")}>
          Graduated
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "graduated" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="dropped" onClick={handleChange("dropped")}>
          Dropped
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "dropped" }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="active">
        <EnrollmentsTable storeKey={storeKeyByStatus.active} />
      </TabsContent>
      <TabsContent value="inactive">
        <EnrollmentsTable storeKey={storeKeyByStatus.inactive} />
      </TabsContent>
      <TabsContent value="transferred">
        <EnrollmentsTable storeKey={storeKeyByStatus.transferred} />
      </TabsContent>
      <TabsContent value="graduated">
        <EnrollmentsTable storeKey={storeKeyByStatus.graduated} />
      </TabsContent>
      <TabsContent value="dropped">
        <EnrollmentsTable storeKey={storeKeyByStatus.dropped} />
      </TabsContent>
    </Tabs>
  );
};

const EnrollmentsTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
    storeKey={storeKey}
    rowClassName={(record) => {
      const statusColors = {
        active: 'border-l-4 border-l-green-500',
        inactive: 'border-l-4 border-l-muted-foreground',
        transferred: 'border-l-4 border-l-blue-500',
        graduated: 'border-l-4 border-l-purple-500',
        dropped: 'border-l-4 border-l-red-500',
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
    <DataTable.Col source="startDate" label="Start Date">
      <TextField source="startDate" />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
    <DataTable.Col label="Section" className="hidden md:table-cell">
      <ReferenceField reference="sections" source="sectionId">
        <TextField source="name" />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.Col source="endDate" label="End Date" className="hidden lg:table-cell">
      <EndDateField />
    </DataTable.Col>
    <DataTable.Col source="id" label="ID" className="hidden lg:table-cell" />
  </DataTable>
);

const StatusBadge = () => {
  const record = useRecordContext();
  if (!record || !record.status) return null;
  
  const variants = {
    enrolled: 'default',
    active: 'default',
    inactive: 'secondary',
    transferred: 'secondary',
    graduated: 'default',
    dropped: 'destructive',
    suspended: 'destructive',
    completed: 'default',
  } as const;
  
  const colors = {
    enrolled: 'text-blue-700 bg-blue-100',
    active: 'text-green-700 bg-green-100',
    inactive: 'text-muted-foreground bg-muted',
    transferred: 'text-orange-700 bg-orange-100',
    graduated: 'text-purple-700 bg-purple-100',
    dropped: 'text-red-700 bg-red-100',
    suspended: 'text-yellow-700 bg-yellow-100',
    completed: 'text-indigo-700 bg-indigo-100',
  } as const;
  
  return (
    <Badge 
      variant={variants[record.status as keyof typeof variants] || 'default'}
      className={colors[record.status as keyof typeof colors] || ''}
    >
      {record.status}
    </Badge>
  );
};

const EndDateField = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  if (record.endDate) {
    return <span>{record.endDate}</span>;
  }
  
  // Show a dash or "Current" for null end dates (active enrollments)
  return <span className="text-muted-foreground">Current</span>;
};

export default EnrollmentsList;
