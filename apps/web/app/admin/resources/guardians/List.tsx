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
import { Phone, Mail, User } from "lucide-react";

// Store keys for different relation types
const storeKeyByRelation = {
  father: "guardians.list.father",
  mother: "guardians.list.mother",
  guardian: "guardians.list.guardian",
  other: "guardians.list.other",
  all: "guardians.list.all",
};

// Label-less filters with placeholders
const guardianFilters = [
  <TextInput source="q" placeholder="Search guardians..." label={false} alwaysOn />,
  <SelectInput 
    source="relation" 
    placeholder="Filter by relation" 
    label={false} 
    choices={[
      { id: 'father', name: 'Father' },
      { id: 'mother', name: 'Mother' },
      { id: 'guardian', name: 'Guardian' },
      { id: 'grandfather', name: 'Grandfather' },
      { id: 'grandmother', name: 'Grandmother' },
      { id: 'uncle', name: 'Uncle' },
      { id: 'aunt', name: 'Aunt' },
      { id: 'other', name: 'Other' }
    ]} 
  />,
  <TextInput source="phone" placeholder="Filter by phone" label={false} />,
  <TextInput source="email" placeholder="Filter by email" label={false} />,
];

export const GuardiansList = () => (
  <List
    sort={{ field: "name", order: "ASC" }}
    filters={guardianFilters}
    perPage={25}
  >
    <TabbedDataTable />
  </List>
);

const TabbedDataTable = () => {
  const listContext = useListContext();
  const { filterValues, setFilters, displayedFilters } = listContext;
  
  const handleChange = (value: string) => () => {
    if (value === "all") {
      const { relation, ...otherFilters } = filterValues;
      setFilters(otherFilters, displayedFilters);
    } else {
      setFilters({ ...filterValues, relation: value }, displayedFilters);
    }
  };
  
  return (
    <Tabs value={filterValues.relation ?? "all"}>
      <TabsList>
        <TabsTrigger value="father" onClick={handleChange("father")}>
          Fathers
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, relation: "father" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="mother" onClick={handleChange("mother")}>
          Mothers
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, relation: "mother" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="guardian" onClick={handleChange("guardian")}>
          Guardians
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, relation: "guardian" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="other" onClick={handleChange("other")}>
          Others
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, relation_in: ["grandfather", "grandmother", "uncle", "aunt", "other"] }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="all" onClick={handleChange("all")}>
          All Guardians
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="father">
        <GuardiansTable storeKey={storeKeyByRelation.father} />
      </TabsContent>
      <TabsContent value="mother">
        <GuardiansTable storeKey={storeKeyByRelation.mother} />
      </TabsContent>
      <TabsContent value="guardian">
        <GuardiansTable storeKey={storeKeyByRelation.guardian} />
      </TabsContent>
      <TabsContent value="other">
        <GuardiansTable storeKey={storeKeyByRelation.other} />
      </TabsContent>
      <TabsContent value="all">
        <GuardiansTable storeKey={storeKeyByRelation.all} />
      </TabsContent>
    </Tabs>
  );
};

const GuardiansTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
    storeKey={storeKey}
    rowClassName={(record) => {
      const relationColors = {
        father: 'border-l-4 border-l-blue-500',
        mother: 'border-l-4 border-l-pink-500',
        guardian: 'border-l-4 border-l-green-500',
        grandfather: 'border-l-4 border-l-purple-400',
        grandmother: 'border-l-4 border-l-purple-400',
        uncle: 'border-l-4 border-l-orange-400',
        aunt: 'border-l-4 border-l-orange-400',
        other: 'border-l-4 border-l-gray-400',
      };
      return relationColors[record.relation] || 'border-l-4 border-l-gray-400';
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col source="name" label="Name">
      <NameWithIcon />
    </DataTable.Col>
    <DataTable.Col source="relation" label="Relation">
      <RelationBadge />
    </DataTable.Col>
    <DataTable.Col source="phone" label="Phone">
      <PhoneWithIcon />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
    <DataTable.Col source="email" label="Email" className="hidden md:table-cell">
      <EmailWithIcon />
    </DataTable.Col>
    <DataTable.Col source="id" label="ID" className="hidden lg:table-cell" />
  </DataTable>
);

const NameWithIcon = ({ record }: { record?: any }) => {
  if (!record) return null;
  
  return (
    <div className="flex items-center gap-2">
      <User className="w-4 h-4 text-gray-500" />
      <span>{record.name}</span>
    </div>
  );
};

const RelationBadge = ({ record }: { record?: any }) => {
  if (!record) return null;
  
  const colors = {
    father: 'text-blue-700 bg-blue-100',
    mother: 'text-pink-700 bg-pink-100',
    guardian: 'text-green-700 bg-green-100',
    grandfather: 'text-purple-700 bg-purple-100',
    grandmother: 'text-purple-700 bg-purple-100',
    uncle: 'text-orange-700 bg-orange-100',
    aunt: 'text-orange-700 bg-orange-100',
    other: 'text-gray-700 bg-gray-100',
  };
  
  return (
    <Badge className={colors[record.relation as keyof typeof colors] || 'text-gray-700 bg-gray-100'}>
      {record.relation}
    </Badge>
  );
};

const PhoneWithIcon = ({ record }: { record?: any }) => {
  if (!record || !record.phone) return null;
  
  return (
    <div className="flex items-center gap-2">
      <Phone className="w-4 h-4 text-gray-500" />
      <span>{record.phone}</span>
    </div>
  );
};

const EmailWithIcon = ({ record }: { record?: any }) => {
  if (!record || !record.email) return null;
  
  return (
    <div className="flex items-center gap-2">
      <Mail className="w-4 h-4 text-gray-500" />
      <span className="truncate">{record.email}</span>
    </div>
  );
};

export default GuardiansList;
