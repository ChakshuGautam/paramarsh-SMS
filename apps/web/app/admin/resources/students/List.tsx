"use client";

import React from "react";
import {
  useRecordContext,
} from "ra-core";
import {
  DataTable,
  List,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  TextField,
  TextInput,
  GenderBadge,
  StatusBadge,
  ListPagination,
  DependentSectionFilter,
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

// Define filters array with consistent height styling
const studentFilters = [
  <TextInput 
    key="search" 
    source="q" 
    placeholder="Search students..." 
    label="" 
    alwaysOn 
    className="h-10"
  />,
  <ReferenceInput key="class" reference="classes" source="classId" label="">
    <SelectInput 
      source="classId"
      optionText="name"
      placeholder="Filter by Class"
      allowEmpty
      emptyText="All Classes"
      className="h-10"
    />
  </ReferenceInput>,
  <DependentSectionFilter 
    key="section"
    source="sectionId"
    classIdSource="classId"
    placeholder="Filter by Section"
    label={false}
    className="h-10"
  />,
  <SelectInput 
    key="gender"
    source="gender"
    label=""
    placeholder="Filter by Gender"
    allowEmpty
    emptyText="All Genders"
    choices={[
      { id: 'male', name: 'Male' },
      { id: 'female', name: 'Female' },
      { id: 'other', name: 'Other' }
    ]}
    className="h-10"
  />,
  <SelectInput 
    key="status"
    source="status"
    label=""
    placeholder="Filter by Status"
    allowEmpty
    emptyText="All Status"
    choices={[
      { id: 'active', name: 'Active' },
      { id: 'inactive', name: 'Inactive' },
      { id: 'graduated', name: 'Graduated' },
      { id: 'transferred', name: 'Transferred' },
      { id: 'dropped', name: 'Dropped' }
    ]}
    className="h-10"
  />
];

export const StudentsList = () => {
  const isMobile = useIsMobile();
  
  return (
    <List
      perPage={10}
      pagination={false}
      sort={{ field: "firstName", order: "ASC" }}
      filters={studentFilters}
    >
      <div className="flex-1 overflow-x-auto">
          <DataTable bulkActionButtons={isMobile ? false : undefined} selectable={!isMobile}>
            {isMobile ? (
              // Mobile-specific columns
              <>
                <DataTable.Col 
                  source="firstName" 
                  label="Student"
                  render={(record) => (
                    <div className="space-y-1">
                      <div className="font-medium">
                        {record.firstName} {record.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {record.admissionNo}
                      </div>
                    </div>
                  )}
                />
                <DataTable.Col 
                  label="Class/Section"
                  render={(record) => (
                    <div className="text-sm">
                      <ReferenceField reference="classes" source="classId">
                        <TextField source="name" />
                      </ReferenceField>
                      {" - "}
                      <ReferenceField reference="sections" source="sectionId">
                        <TextField source="name" />
                      </ReferenceField>
                    </div>
                  )}
                />
                <DataTable.Col 
                  source="status" 
                  label="Status"
                  className="text-right"
                >
                  <StatusBadge size="sm" />
                </DataTable.Col>
              </>
            ) : (
              // Desktop columns
              <>
                <DataTable.Col 
                  source="admissionNo" 
                  label="Admission No"
                  className="min-w-[120px]" 
                />
                <DataTable.Col 
                  source="firstName" 
                  label="First Name"
                />
                <DataTable.Col 
                  source="lastName" 
                  label="Last Name" 
                />
                <DataTable.Col 
                  source="status" 
                  label="Status"
                >
                  <StatusBadge size="sm" />
                </DataTable.Col>
                <DataTable.Col 
                  source="gender" 
                  label="Gender"
                  className="hidden lg:table-cell"
                >
                  <GenderBadge size="sm" />
                </DataTable.Col>
                <DataTable.Col 
                  label="Class"
                >
                  <ReferenceField reference="classes" source="classId">
                    <TextField source="name" />
                  </ReferenceField>
                </DataTable.Col>
                <DataTable.Col 
                  label="Section"
                  className="hidden xl:table-cell"
                >
                  <ReferenceField reference="sections" source="sectionId">
                    <TextField source="name" />
                  </ReferenceField>
                </DataTable.Col>
                <DataTable.Col 
                  label="Guardian Phone" 
                  className="hidden xl:table-cell"
                >
                  <GuardianPhones />
                </DataTable.Col>
              </>
            )}
          </DataTable>
          <ListPagination className="justify-start mt-2" />
      </div>
    </List>
  );
};


// Component to display guardian phone numbers
const GuardianPhones = () => {
  const record = useRecordContext();
  if (!record?.guardians || record.guardians.length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }
  
  // Get primary guardian or first guardian
  // guardians is now an array of StudentGuardian objects with guardian nested
  const primaryRelation = record.guardians.find((sg: any) => sg.isPrimary) || record.guardians[0];
  const guardian = primaryRelation?.guardian;
  
  if (!guardian) {
    return <span className="text-muted-foreground">No guardian</span>;
  }
  
  const phoneNumbers = [];
  if (guardian.phoneNumber) {
    phoneNumbers.push(guardian.phoneNumber);
  }
  if (guardian.alternatePhoneNumber) {
    phoneNumbers.push(guardian.alternatePhoneNumber);
  }
  
  if (phoneNumbers.length === 0) {
    return <span className="text-muted-foreground">No phone</span>;
  }
  
  return (
    <div className="space-y-1">
      {phoneNumbers.map((phone, index) => (
        <div key={index} className="text-sm">
          {phone}
          {index === 0 && primaryRelation.relation && (
            <span className="text-xs text-muted-foreground ml-1">
              ({primaryRelation.relation})
            </span>
          )}
        </div>
      ))}
    </div>
  );
};



export default StudentsList;
