"use client";

<<<<<<< HEAD
import { useRecordContext } from "ra-core";
=======
import { useListContext, useRecordContext } from "ra-core";
>>>>>>> origin/main
import { Link } from "react-router-dom";
import {
  DataTable,
  List,
<<<<<<< HEAD
  TextField,
  TabbedResourceList,
  statusTabs,
  RelationBadge,
  TextInput,
  SelectInput,
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, User } from "lucide-react";
import { getRelationColor } from "@/lib/theme/colors";

const filters = [
  <TextInput source="q" placeholder="Search..." label="" alwaysOn />,
  <SelectInput 
    source="relation" 
    placeholder="Filter by relation..." 
=======
  TextInput,
  SelectInput,
  TextField,
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
  <TextInput source="q" placeholder="Search guardians..." label="" alwaysOn />,
  <SelectInput 
    source="relation" 
    placeholder="Filter by relation" 
>>>>>>> origin/main
    label="" 
    choices={[
      { id: 'father', name: 'Father' },
      { id: 'mother', name: 'Mother' },
      { id: 'guardian', name: 'Guardian' },
<<<<<<< HEAD
      { id: 'other', name: 'Other' },
    ]} 
  />,
  <TextInput source="phone" placeholder="Filter by phone..." label="" />,
  <TextInput source="email" placeholder="Filter by email..." label="" />,
=======
      { id: 'grandfather', name: 'Grandfather' },
      { id: 'grandmother', name: 'Grandmother' },
      { id: 'uncle', name: 'Uncle' },
      { id: 'aunt', name: 'Aunt' },
      { id: 'other', name: 'Other' }
    ]} 
  />,
  <TextInput source="phone" placeholder="Filter by phone" label="" />,
  <TextInput source="email" placeholder="Filter by email" label="" />,
>>>>>>> origin/main
];

export const GuardiansList = () => (
  <List
<<<<<<< HEAD
    filters={filters}
    sort={{ field: "name", order: "ASC" }}
    perPage={10}
  >
    <TabbedResourceList
      tabs={statusTabs.guardianRelation}
      defaultTab="all"
    >
      {(tab) => <GuardiansTable storeKey={tab.storeKey} />}
    </TabbedResourceList>
  </List>
);

// Component to display wards (students) with links

=======
    sort={{ field: "name", order: "ASC" }}
    filters={guardianFilters}
    perPage={10}
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

// Component to display wards (students) with links
>>>>>>> origin/main
const WardLinks = () => {
  const record = useRecordContext();
  
  // Handle both old format (record.student) and new format (record.students array)
  if (!record?.students || record.students.length === 0) {
    // Fallback to old format if exists
    if (record?.student) {
      const student = record.student;
      const displayName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown Student';
      return (
        <Link 
          to={`/admin#/students/${student.id}/show`}
          className="text-primary hover:underline flex items-center gap-1"
        >
          <User className="h-3 w-3" />
          <span>{displayName}</span>
          {student.admissionNo && (
            <span className="text-xs text-muted-foreground ml-1">
              ({student.admissionNo})
            </span>
          )}
        </Link>
      );
    }
    return <span className="text-muted-foreground">No wards linked</span>;
  }
  
  // Display all linked students (wards)
  return (
    <div className="space-y-1">
      {record.students.map((sg: any, index: number) => {
        const student = sg.student;
        if (!student) return null;
        
        const displayName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown Student';
        
        return (
          <Link 
            key={student.id}
            to={`/admin#/students/${student.id}/show`}
            className="text-primary hover:underline flex items-center gap-1 text-sm"
          >
            <User className="h-3 w-3" />
            <span>{displayName}</span>
            {student.admissionNo && (
              <span className="text-xs text-muted-foreground ml-1">
                ({student.admissionNo})
              </span>
            )}
            {sg.relation && (
              <Badge className="ml-1 text-xs py-0 px-1" variant="outline">
                {sg.relation}
              </Badge>
            )}
          </Link>
        );
      })}
    </div>
  );
};

const GuardiansTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
    storeKey={storeKey}
    rowClassName={(record) => {
<<<<<<< HEAD
      const relationColor = getRelationColor(record.relation);
      return `border-l-4 ${relationColor.border}`;
=======
      const relationColors = {
        father: 'border-l-4 border-l-blue-500',
        mother: 'border-l-4 border-l-pink-500',
        guardian: 'border-l-4 border-l-green-500',
        grandfather: 'border-l-4 border-l-purple-400',
        grandmother: 'border-l-4 border-l-purple-400',
        uncle: 'border-l-4 border-l-orange-400',
        aunt: 'border-l-4 border-l-orange-400',
        other: 'border-l-4 border-l-muted-foreground',
      };
      return relationColors[record.relation] || 'border-l-4 border-l-muted-foreground';
>>>>>>> origin/main
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col source="name" label="Name">
      <TextField source="name" />
    </DataTable.Col>
    <DataTable.Col source="relation" label="Relation">
<<<<<<< HEAD
      <RelationBadge size="sm" showIcon />
=======
      <RelationBadge />
>>>>>>> origin/main
    </DataTable.Col>
    <DataTable.Col source="phone" label="Phone">
      <TextField source="phone" />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
    <DataTable.Col source="email" label="Email" className="hidden md:table-cell">
      <TextField source="email" />
    </DataTable.Col>
    <DataTable.Col label="Wards/Students" className="hidden lg:table-cell">
      <WardLinks />
    </DataTable.Col>
  </DataTable>
);

const NameWithIcon = ({ record }: { record?: any }) => {
  if (!record || !record.name) return <span className="text-muted-foreground">[No Name]</span>;
  
  return (
    <div className="flex items-center gap-2">
      <User className="w-4 h-4 text-muted-foreground" />
      <span>{record.name}</span>
    </div>
  );
};

<<<<<<< HEAD
// Removed - now using shared RelationBadge component
=======
const RelationBadge = () => {
  const record = useRecordContext();
  if (!record || !record.relation) return null;
  
  const colors = {
    father: 'text-blue-700 bg-blue-100',
    mother: 'text-pink-700 bg-pink-100',
    guardian: 'text-green-700 bg-green-100',
    grandfather: 'text-purple-700 bg-purple-100',
    grandmother: 'text-purple-700 bg-purple-100',
    uncle: 'text-orange-700 bg-orange-100',
    aunt: 'text-orange-700 bg-orange-100',
    other: 'text-muted-foreground bg-muted',
  };
  
  return (
    <Badge className={colors[record.relation as keyof typeof colors] || 'text-muted-foreground bg-muted'}>
      {record.relation}
    </Badge>
  );
};
>>>>>>> origin/main

const PhoneWithIcon = ({ record }: { record?: any }) => {
  if (!record || !record.phone) return null;
  
  return (
    <div className="flex items-center gap-2">
      <Phone className="w-4 h-4 text-muted-foreground" />
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
