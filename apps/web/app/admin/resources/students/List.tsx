"use client";

import type { ReactNode } from "react";
import {
  useRecordContext,
  Translate,
  useTranslate,
  FilterLiveForm,
} from "ra-core";
import {
  DataTable,
  List,
  ReferenceField,
  TextField,
  ToggleFilterButton,
  TextInput,
  GenderBadge,
  StatusBadge,
  ListPagination,
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { User, BookOpen, Users } from "lucide-react";
import { getStatusColor } from "@/lib/theme/colors";

export const StudentsList = () => {
  return (
    <List
      perPage={10}
      pagination={false}
      sort={{ field: "firstName", order: "ASC" }}
    >
      <div className="flex flex-row gap-4 mb-4">
        <SidebarFilters />
        <div className="flex-1">
          <DataTable>
            <DataTable.Col source="admissionNo" label="Admission No" />
            <DataTable.Col source="firstName" label="First Name" />
            <DataTable.Col source="lastName" label="Last Name" />
            <DataTable.Col 
              source="status" 
              label="Status"
            >
              <StatusBadge size="sm" />
            </DataTable.Col>
            <DataTable.Col 
              source="gender" 
              label="Gender" 
              className="hidden md:table-cell"
            >
              <GenderBadge size="sm" />
            </DataTable.Col>
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
            <DataTable.Col label="Guardian Phone" className="hidden lg:table-cell">
              <GuardianPhones />
            </DataTable.Col>
          </DataTable>
          <ListPagination className="justify-start mt-2" />
        </div>
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

const SidebarFilters = () => {
  const translate = useTranslate();
  return (
    <div className="min-w-48 hidden md:block">
      <FilterLiveForm>
        <TextInput
          source="q"
          placeholder={translate("ra.action.search")}
          label=""
          className="mb-6"
        />
      </FilterLiveForm>
      <FilterCategory
        icon={<User size={16} />}
        label="Gender"
      >
        <ToggleFilterButton
          label="Male"
          value={{ gender: "male" }}
        />
        <ToggleFilterButton
          label="Female"
          value={{ gender: "female" }}
        />
      </FilterCategory>
      <FilterCategory
        icon={<BookOpen size={16} />}
        label="Status"
      >
        <ToggleFilterButton
          label="Active"
          value={{ status: "active" }}
        />
        <ToggleFilterButton
          label="Inactive"
          value={{ status: "inactive" }}
        />
        <ToggleFilterButton
          label="Transferred"
          value={{ status: "transferred" }}
        />
      </FilterCategory>
    </div>
  );
};

const FilterCategory = ({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children?: ReactNode;
}) => (
  <>
    <h3 className="flex flex-row items-center gap-2 mb-1 font-bold text-sm">
      {icon}
      <Translate i18nKey={label} />
    </h3>
    <div className="flex flex-col items-start ml-3 mb-4">{children}</div>
  </>
);


export default StudentsList;
