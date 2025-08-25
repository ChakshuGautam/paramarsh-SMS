"use client";

import { useListContext } from "ra-core";
import {
  DataTable,
  List,
  ReferenceField,
  TextField,
<<<<<<< HEAD
  ArrayField,
  SingleFieldList,
  Count,
  TextInput,
  SelectInput,
  NumberInput,
=======
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  ArrayField,
  SingleFieldList,
  Count,
>>>>>>> origin/main
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Store keys for different grade level groups
const storeKeyByLevel = {
  primary: "feeStructures.list.primary",
  middle: "feeStructures.list.middle",
  high: "feeStructures.list.high",
  all: "feeStructures.list.all",
};

// Helper function to get grade level filters
const getGradeLevelFilter = (level: string) => {
  switch (level) {
    case "primary":
      return { "grade.gradeLevel_gte": 1, "grade.gradeLevel_lte": 5 };
    case "middle":
      return { "grade.gradeLevel_gte": 6, "grade.gradeLevel_lte": 8 };
    case "high":
      return { "grade.gradeLevel_gte": 9, "grade.gradeLevel_lte": 12 };
    default:
      return {};
  }
};

// Label-less filters with placeholders
const feeStructureFilters = [
  <TextInput source="q" placeholder="Search fee structures..." label="" alwaysOn />,
<<<<<<< HEAD
  <SelectInput 
    source="gradeId" 
    placeholder="Filter by grade" 
    label=""
    choices={[]} // Would need to be populated with grade data
  />,
  <SelectInput 
    source="gradeLevel" 
    placeholder="Filter by grade level" 
    label=""
    choices={[
      { id: '1-5', name: 'Primary (1-5)' },
      { id: '6-8', name: 'Middle (6-8)' },
      { id: '9-12', name: 'High (9-12)' }
    ]}
  />,
  <NumberInput source="totalAmount_gte" placeholder="Min total amount" label="" />,
  <NumberInput source="totalAmount_lte" placeholder="Max total amount" label="" />,
=======
  <ReferenceInput source="gradeId" reference="classes">
    <AutocompleteInput placeholder="Filter by grade" label="" optionText="name" />
  </ReferenceInput>,
>>>>>>> origin/main
];

export const FeeStructuresList = () => (
  <List
    sort={{ field: "gradeId", order: "ASC" }}
    filters={feeStructureFilters}
    perPage={10}
  >
    <TabbedDataTable />
  </List>
);

const TabbedDataTable = () => {
  const listContext = useListContext();
  const { filterValues, setFilters, displayedFilters } = listContext;
  
  const handleChange = (value: string) => () => {
    const gradeLevelFilter = getGradeLevelFilter(value);
    setFilters({ ...filterValues, ...gradeLevelFilter }, displayedFilters);
  };
  
  // Determine current tab based on filter values
  const getCurrentTab = () => {
    if (filterValues["grade.gradeLevel_gte"] === 1 && filterValues["grade.gradeLevel_lte"] === 5) return "primary";
    if (filterValues["grade.gradeLevel_gte"] === 6 && filterValues["grade.gradeLevel_lte"] === 8) return "middle";
    if (filterValues["grade.gradeLevel_gte"] === 9 && filterValues["grade.gradeLevel_lte"] === 12) return "high";
    return "all";
  };
  
  return (
    <Tabs value={getCurrentTab()}>
      <TabsList>
        <TabsTrigger value="primary" onClick={handleChange("primary")}>
          Primary (1-5)
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getGradeLevelFilter("primary") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="middle" onClick={handleChange("middle")}>
          Middle (6-8)
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getGradeLevelFilter("middle") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="high" onClick={handleChange("high")}>
          High (9-12)
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getGradeLevelFilter("high") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="all" onClick={handleChange("all")}>
          All Structures
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getGradeLevelFilter("all") }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="primary">
        <FeeStructuresTable storeKey={storeKeyByLevel.primary} />
      </TabsContent>
      <TabsContent value="middle">
        <FeeStructuresTable storeKey={storeKeyByLevel.middle} />
      </TabsContent>
      <TabsContent value="high">
        <FeeStructuresTable storeKey={storeKeyByLevel.high} />
      </TabsContent>
      <TabsContent value="all">
        <FeeStructuresTable storeKey={storeKeyByLevel.all} />
      </TabsContent>
    </Tabs>
  );
};

const FeeStructuresTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable storeKey={storeKey}>
    {/* Always visible columns */}
    <DataTable.Col label="Grade">
      <ReferenceField reference="classes" source="gradeId">
        <TextField source="name" />
      </ReferenceField>
    </DataTable.Col>
<<<<<<< HEAD
    <DataTable.Col label="Total Amount" render={(record) => <TotalAmountBadge record={record} />} />
    <DataTable.Col label="Components Count" render={(record) => <ComponentsCountBadge record={record} />} />
=======
    <DataTable.Col label="Total Amount">
      <TotalAmountBadge />
    </DataTable.Col>
    <DataTable.Col label="Components Count">
      <ComponentsCountBadge />
    </DataTable.Col>
>>>>>>> origin/main
    
    {/* Desktop-only columns */}
    <DataTable.Col label="Components" className="hidden lg:table-cell">
      <ArrayField source="components">
        <SingleFieldList
          render={(item: any) => (
            <Badge key={item.id} variant="secondary" className="mr-1 mb-1">
              {item.name} ₹{item.amount}
            </Badge>
          )}
        />
      </ArrayField>
    </DataTable.Col>
<<<<<<< HEAD
=======
    <DataTable.Col source="id" label="ID" className="hidden lg:table-cell" />
>>>>>>> origin/main
  </DataTable>
);

const TotalAmountBadge = ({ record }: { record?: any }) => {
<<<<<<< HEAD
  if (!record) return null;
  
  const components = record.components || [];
  const total = components.reduce((sum: number, component: any) => {
=======
  if (!record || !record.components) return null;
  
  const total = record.components.reduce((sum: number, component: any) => {
>>>>>>> origin/main
    return sum + (parseFloat(component.amount) || 0);
  }, 0);
  
  const getAmountColor = () => {
    if (total >= 50000) return 'text-red-700 bg-red-100';
    if (total >= 25000) return 'text-orange-700 bg-orange-100';
    return 'text-green-700 bg-green-100';
  };
  
  return (
    <Badge className={getAmountColor()}>
      ₹{total.toLocaleString()}
    </Badge>
  );
};

const ComponentsCountBadge = ({ record }: { record?: any }) => {
<<<<<<< HEAD
  if (!record) return null;
  
  const components = record.components || [];
  const count = components.length;
=======
  if (!record || !record.components) return null;
  
  const count = record.components.length;
>>>>>>> origin/main
  const getCountColor = () => {
    if (count >= 5) return 'text-purple-700 bg-purple-100';
    if (count >= 3) return 'text-blue-700 bg-blue-100';
    return 'text-gray-700 bg-gray-100';
  };
  
  return (
    <Badge className={getCountColor()}>
      {count} component{count !== 1 ? 's' : ''}
    </Badge>
  );
};

export default FeeStructuresList;
