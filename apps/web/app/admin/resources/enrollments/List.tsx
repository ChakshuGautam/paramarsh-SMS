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
  TabbedResourceList,
  statusTabs,
  StatusBadge,
  ToggleFilterButton,
  TextInput,
  ListPagination,
} from "@/components/admin";
import { Search, Users, Calendar } from "lucide-react";
import { getStatusColor } from "@/lib/theme/colors";

export const EnrollmentsList = () => (
  <List
    sort={{ field: "startDate", order: "DESC" }}
    filterDefaultValues={{ status: "active" }}
    perPage={10}
    pagination={false}
  >
    <div className="flex flex-row gap-4 mb-4">
      <SidebarFilters />
      <div className="flex-1">
        <TabbedResourceList
          tabs={statusTabs.enrollment}
          defaultTab="active"
        >
          {(tab) => (
            <>
              <EnrollmentsTable storeKey={tab.storeKey} />
              <ListPagination className="justify-start mt-2" />
            </>
          )}
        </TabbedResourceList>
      </div>
    </div>
  </List>
);


const EnrollmentsTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
    storeKey={storeKey}
    rowClassName={(record) => {
      const statusColor = getStatusColor(record.status);
      return `border-l-4 ${statusColor.border}`;
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col label="Student">
      <ReferenceField reference="students" source="studentId" link="show">
        <TextField source="fullName" />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.Col source="status" label="Status">
      <StatusBadge size="sm" />
    </DataTable.Col>
    <DataTable.Col source="startDate" label="Start Date">
      <TextField source="startDate" />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
    <DataTable.Col label="Section">
      <ReferenceField reference="sections" source="sectionId" link="show">
        <TextField source="name" />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.Col source="endDate" label="End Date" className="hidden lg:table-cell">
      <EndDateField />
    </DataTable.Col>
  </DataTable>
);

// Removed - now using shared StatusBadge component

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
        icon={<Users size={16} />}
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
          label="Completed"
          value={{ status: "completed" }}
        />
        <ToggleFilterButton
          label="Withdrawn"
          value={{ status: "withdrawn" }}
        />
      </FilterCategory>
      <FilterCategory
        icon={<Calendar size={16} />}
        label="Date Range"
      >
        <FilterLiveForm>
          <TextInput
            source="startDate_gte"
            placeholder="From date (YYYY-MM-DD)"
            label=""
            className="mb-2"
          />
        </FilterLiveForm>
        <FilterLiveForm>
          <TextInput
            source="endDate_lte"
            placeholder="To date (YYYY-MM-DD)"
            label=""
          />
        </FilterLiveForm>
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
