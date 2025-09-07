"use client";

import { useRecordContext } from "ra-core";
import { Link } from "react-router-dom";
import {
  DataTable,
  List,
  TextField,
  TabbedResourceList,
  statusTabs,
  RelationBadge,
  TextInput,
  SelectInput,
  ListPagination,
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, User } from "lucide-react";
import { getRelationColor } from "@/lib/theme/colors";

const filters = [
  <TextInput source="q" placeholder="Search..." label="" alwaysOn />,
  <SelectInput 
    source="relation" 
    placeholder="Filter by relation..." 
    label="" 
    choices={[
      { id: 'father', name: 'Father' },
      { id: 'mother', name: 'Mother' },
      { id: 'guardian', name: 'Guardian' },
      { id: 'other', name: 'Other' },
    ]} 
  />,
  <TextInput source="phone" placeholder="Filter by phone..." label="" />,
  <TextInput source="email" placeholder="Filter by email..." label="" />,
];

export const GuardiansList = () => (
  <List
    filters={filters}
    sort={{ field: "name", order: "ASC" }}
    perPage={10}
    pagination={false}
  >
    <TabbedResourceList
      tabs={statusTabs.guardianRelation}
      defaultTab="all"
    >
      {(tab) => (
        <>
          <GuardiansTable storeKey={tab.storeKey} />
          <ListPagination className="justify-start mt-2" />
        </>
      )}
    </TabbedResourceList>
  </List>
);

// Component to display wards (students) with links

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
      const relationColor = getRelationColor(record.relation);
      return `border-l-4 ${relationColor.border}`;
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col source="name" label="Name">
      <TextField source="name" />
    </DataTable.Col>
    <DataTable.Col source="relation" label="Relation">
      <RelationBadge size="sm" showIcon />
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

// Removed - now using shared RelationBadge component

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
