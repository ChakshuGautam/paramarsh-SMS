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
  ToggleFilterButton,
  TextInput,
  StatusBadge,
  ListPagination,
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { User, Building, Award, CheckCircle } from "lucide-react";
import { getStatusColor, getDesignationColor } from "@/lib/theme/colors";

export const StaffList = () => {
  return (
    <List
      perPage={10}
      sort={{ field: "firstName", order: "ASC" }}
      pagination={false}
    >
      <div className="flex flex-row gap-4 mb-4">
        <SidebarFilters />
        <div className="flex-1">
          <DataTable>
            <DataTable.Col source="firstName" label="First Name" />
            <DataTable.Col source="lastName" label="Last Name" />
            <DataTable.Col source="status" label="Status">
              <StatusBadge size="sm" />
            </DataTable.Col>
            <DataTable.Col 
              source="designation" 
              label="Designation" 
              className="hidden md:table-cell"
            >
              <DesignationBadge />
            </DataTable.Col>
            <DataTable.Col 
              source="department" 
              label="Department" 
              className="hidden lg:table-cell" 
            />
            <DataTable.Col 
              source="id" 
              label="ID" 
              className="hidden lg:table-cell" 
            />
          </DataTable>
          <ListPagination className="justify-start mt-2" />
        </div>
      </div>
    </List>
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
        icon={<CheckCircle size={16} />}
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
          label="On Leave"
          value={{ status: "on_leave" }}
        />
      </FilterCategory>
      <FilterCategory
        icon={<Building size={16} />}
        label="Department"
      >
        <ToggleFilterButton
          label="Administration"
          value={{ department: "Administration" }}
        />
        <ToggleFilterButton
          label="Academic"
          value={{ department: "Academic" }}
        />
        <ToggleFilterButton
          label="Support"
          value={{ department: "Support" }}
        />
      </FilterCategory>
      <FilterCategory
        icon={<Award size={16} />}
        label="Designation"
      >
        <ToggleFilterButton
          label="Principal"
          value={{ designation: "Principal" }}
        />
        <ToggleFilterButton
          label="Vice Principal"
          value={{ designation: "Vice Principal" }}
        />
        <ToggleFilterButton
          label="HOD"
          value={{ designation: "HOD" }}
        />
        <ToggleFilterButton
          label="Clerk"
          value={{ designation: "Clerk" }}
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

const DesignationBadge = () => {
  const record = useRecordContext();
  if (!record || !record.designation) return null;
  
  // Use centralized designation color function
  const designationColor = getDesignationColor(record.designation);
  
  return (
    <Badge className={`${designationColor.background} ${designationColor.text}`}>
      {record.designation}
    </Badge>
  );
};


export default StaffList;
