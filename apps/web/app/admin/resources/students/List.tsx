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

// Store keys for different status tabs
const storeKeyByStatus = {
  active: "students.list.active",
  inactive: "students.list.inactive",
  graduated: "students.list.graduated",
};

// Label-less filters with placeholders
const studentFilters = [
  <TextInput source="q" placeholder="Search students..." label={false} alwaysOn />,
  <ReferenceInput source="classId" reference="classes">
    <AutocompleteInput placeholder="Filter by class" label={false} optionText="name" />
  </ReferenceInput>,
  <ReferenceInput source="sectionId" reference="sections">
    <AutocompleteInput placeholder="Filter by section" label={false} optionText="name" />
  </ReferenceInput>,
  <SelectInput 
    source="gender" 
    placeholder="Filter by gender" 
    label={false} 
    choices={[
      { id: 'male', name: 'Male' },
      { id: 'female', name: 'Female' },
      { id: 'other', name: 'Other' }
    ]} 
  />,
];

export const StudentsList = () => (
  <List
    sort={{ field: "firstName", order: "ASC" }}
    filterDefaultValues={{ status: "active" }}
    filters={studentFilters}
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
    <Tabs value={filterValues.status ?? "active"} className="mb-4">
      <TabsList className="w-full">
        <TabsTrigger value="active" onClick={handleChange("active")}>
          Active
          <Badge variant="outline" className="ml-2 hidden md:inline-flex">
            <Count filter={{ ...filterValues, status: "active" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="inactive" onClick={handleChange("inactive")}>
          Inactive
          <Badge variant="outline" className="ml-2 hidden md:inline-flex">
            <Count filter={{ ...filterValues, status: "inactive" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="graduated" onClick={handleChange("graduated")}>
          Graduated
          <Badge variant="outline" className="ml-2 hidden md:inline-flex">
            <Count filter={{ ...filterValues, status: "graduated" }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="active">
        <StudentsTable storeKey={storeKeyByStatus.active} />
      </TabsContent>
      <TabsContent value="inactive">
        <StudentsTable storeKey={storeKeyByStatus.inactive} />
      </TabsContent>
      <TabsContent value="graduated">
        <StudentsTable storeKey={storeKeyByStatus.graduated} />
      </TabsContent>
    </Tabs>
  );
};

const StudentsTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
    storeKey={storeKey}
    rowClassName={(record) => {
      const statusColors = {
        active: 'border-l-4 border-l-green-500',
        inactive: 'border-l-4 border-l-gray-400',
        graduated: 'border-l-4 border-l-blue-500',
      };
      return statusColors[record.status] || '';
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col source="admissionNo" label="Admission No" />
    <DataTable.Col source="firstName" label="First Name" />
    <DataTable.Col source="lastName" label="Last Name" />
    
    {/* Desktop-only columns */}
    <DataTable.Col source="gender" label="Gender" className="hidden md:table-cell" />
    <DataTable.Col label="Class" className="hidden md:table-cell">
      <ReferenceField reference="classes" source="classId">
        <TextField source="name" />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.Col label="Section" className="hidden lg:table-cell">
      <ReferenceField reference="sections" source="sectionId">
        <TextField source="name" />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.Col source="id" label="ID" className="hidden lg:table-cell" />
  </DataTable>
);

export default StudentsList;