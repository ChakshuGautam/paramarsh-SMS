"use client";

import { useListContext } from "ra-core";
import {
  DataTable,
  List,
  TextInput,
  SelectInput,
  Count,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Store keys for different status tabs
const storeKeyByStatus = {
  active: "staff.list.active",
  inactive: "staff.list.inactive",
  on_leave: "staff.list.on_leave",
  terminated: "staff.list.terminated",
};

// Label-less filters with placeholders
const staffFilters = [
  <TextInput source="q" placeholder="Search staff..." label={false} alwaysOn />,
  <TextInput source="department" placeholder="Filter by department" label={false} />,
  <TextInput source="designation" placeholder="Filter by designation" label={false} />,
];

export const StaffList = () => (
  <List
    sort={{ field: "firstName", order: "ASC" }}
    filterDefaultValues={{ status: "active" }}
    filters={staffFilters}
    perPage={25}
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
        <TabsTrigger value="on_leave" onClick={handleChange("on_leave")}>
          On Leave
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "on_leave" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="terminated" onClick={handleChange("terminated")}>
          Terminated
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "terminated" }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="active">
        <StaffTable storeKey={storeKeyByStatus.active} />
      </TabsContent>
      <TabsContent value="inactive">
        <StaffTable storeKey={storeKeyByStatus.inactive} />
      </TabsContent>
      <TabsContent value="on_leave">
        <StaffTable storeKey={storeKeyByStatus.on_leave} />
      </TabsContent>
      <TabsContent value="terminated">
        <StaffTable storeKey={storeKeyByStatus.terminated} />
      </TabsContent>
    </Tabs>
  );
};

const StaffTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
    storeKey={storeKey}
    rowClassName={(record) => {
      const statusColors = {
        active: 'border-l-4 border-l-green-500',
        inactive: 'border-l-4 border-l-gray-400',
        on_leave: 'border-l-4 border-l-yellow-500',
        terminated: 'border-l-4 border-l-red-500',
      };
      return statusColors[record.status] || '';
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col source="firstName" label="First Name" />
    <DataTable.Col source="lastName" label="Last Name" />
    <DataTable.Col source="status" label="Status">
      <StatusBadge />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
    <DataTable.Col source="designation" label="Designation" className="hidden md:table-cell">
      <DesignationBadge />
    </DataTable.Col>
    <DataTable.Col source="department" label="Department" className="hidden lg:table-cell" />
    <DataTable.Col source="id" label="ID" className="hidden lg:table-cell" />
  </DataTable>
);

const StatusBadge = ({ record }: { record?: any }) => {
  if (!record) return null;
  
  const variants = {
    active: 'default',
    inactive: 'secondary',
    on_leave: 'warning',
    terminated: 'destructive',
  } as const;
  
  const labels = {
    active: 'Active',
    inactive: 'Inactive',
    on_leave: 'On Leave',
    terminated: 'Terminated',
  };
  
  return (
    <Badge variant={variants[record.status as keyof typeof variants] || 'default'}>
      {labels[record.status as keyof typeof labels] || record.status}
    </Badge>
  );
};

const DesignationBadge = ({ record }: { record?: any }) => {
  if (!record || !record.designation) return null;
  
  // Color coding based on common designations
  const getDesignationColor = (designation: string) => {
    const lower = designation.toLowerCase();
    if (lower.includes('principal') || lower.includes('director')) return 'text-purple-700 bg-purple-100';
    if (lower.includes('teacher') || lower.includes('instructor')) return 'text-blue-700 bg-blue-100';
    if (lower.includes('admin') || lower.includes('coordinator')) return 'text-green-700 bg-green-100';
    if (lower.includes('clerk') || lower.includes('assistant')) return 'text-orange-700 bg-orange-100';
    return 'text-gray-700 bg-gray-100';
  };
  
  return (
    <Badge className={getDesignationColor(record.designation)}>
      {record.designation}
    </Badge>
  );
};

export default StaffList;
