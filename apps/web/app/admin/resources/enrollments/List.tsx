"use client";

<<<<<<< HEAD
import type { ReactNode } from "react";
import {
  useRecordContext,
  Translate,
  useTranslate,
  FilterLiveForm,
} from "ra-core";
=======
import { useListContext, useRecordContext } from "ra-core";
>>>>>>> origin/main
import {
  DataTable,
  List,
  ReferenceField,
  TextField,
<<<<<<< HEAD
  TabbedResourceList,
  statusTabs,
  StatusBadge,
  ToggleFilterButton,
  TextInput,
} from "@/components/admin";
import { Search, Users, Calendar } from "lucide-react";
import { getStatusColor } from "@/lib/theme/colors";
=======
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  DateRangeInput,
  Count,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Store keys for different status tabs
const storeKeyByStatus = {
  active: "enrollments.list.active",
  inactive: "enrollments.list.inactive",
  transferred: "enrollments.list.transferred",
  graduated: "enrollments.list.graduated",
  dropped: "enrollments.list.dropped",
};

// Label-less filters with placeholders
const enrollmentFilters = [
  <TextInput source="q" placeholder="Search enrollments..." label="" alwaysOn />,
  <ReferenceInput source="studentId" reference="students">
    <AutocompleteInput 
      placeholder="Filter by student" 
      label="" 
      optionText={(record) => `${record.firstName} ${record.lastName}`}
    />
  </ReferenceInput>,
  <ReferenceInput source="sectionId" reference="sections">
    <AutocompleteInput placeholder="Filter by section" label="" optionText="name" />
  </ReferenceInput>,
  <DateRangeInput 
    source="enrollment"
    sourceFrom="startDate_gte"
    sourceTo="endDate_lte"
    label=""
    placeholder="Select enrollment period"
  />,
];
>>>>>>> origin/main

export const EnrollmentsList = () => (
  <List
    sort={{ field: "startDate", order: "DESC" }}
    filterDefaultValues={{ status: "active" }}
<<<<<<< HEAD
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
          {(tab) => <EnrollmentsTable storeKey={tab.storeKey} />}
        </TabbedResourceList>
      </div>
    </div>
  </List>
);

=======
    filters={enrollmentFilters}
    perPage={10}
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
        <TabsTrigger value="transferred" onClick={handleChange("transferred")}>
          Transferred
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "transferred" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="graduated" onClick={handleChange("graduated")}>
          Graduated
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "graduated" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="dropped" onClick={handleChange("dropped")}>
          Dropped
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "dropped" }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="active">
        <EnrollmentsTable storeKey={storeKeyByStatus.active} />
      </TabsContent>
      <TabsContent value="inactive">
        <EnrollmentsTable storeKey={storeKeyByStatus.inactive} />
      </TabsContent>
      <TabsContent value="transferred">
        <EnrollmentsTable storeKey={storeKeyByStatus.transferred} />
      </TabsContent>
      <TabsContent value="graduated">
        <EnrollmentsTable storeKey={storeKeyByStatus.graduated} />
      </TabsContent>
      <TabsContent value="dropped">
        <EnrollmentsTable storeKey={storeKeyByStatus.dropped} />
      </TabsContent>
    </Tabs>
  );
};
>>>>>>> origin/main

const EnrollmentsTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
    storeKey={storeKey}
    rowClassName={(record) => {
<<<<<<< HEAD
      const statusColor = getStatusColor(record.status);
      return `border-l-4 ${statusColor.border}`;
=======
      const statusColors = {
        active: 'border-l-4 border-l-green-500',
        inactive: 'border-l-4 border-l-muted-foreground',
        transferred: 'border-l-4 border-l-blue-500',
        graduated: 'border-l-4 border-l-purple-500',
        dropped: 'border-l-4 border-l-red-500',
      };
      return statusColors[record.status] || '';
>>>>>>> origin/main
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col label="Student">
<<<<<<< HEAD
      <ReferenceField reference="students" source="studentId" link={false}>
        <TextField source="fullName" />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.Col source="status" label="Status">
      <StatusBadge size="sm" />
=======
      <ReferenceField reference="students" source="studentId">
        <TextField source="firstName" />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.Col source="status" label="Status">
      <StatusBadge />
>>>>>>> origin/main
    </DataTable.Col>
    <DataTable.Col source="startDate" label="Start Date">
      <TextField source="startDate" />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
    <DataTable.Col label="Section" className="hidden md:table-cell">
<<<<<<< HEAD
      <ReferenceField reference="sections" source="sectionId" link={false}>
=======
      <ReferenceField reference="sections" source="sectionId">
>>>>>>> origin/main
        <TextField source="name" />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.Col source="endDate" label="End Date" className="hidden lg:table-cell">
      <EndDateField />
    </DataTable.Col>
<<<<<<< HEAD
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

=======
    <DataTable.Col source="id" label="ID" className="hidden lg:table-cell" />
  </DataTable>
);

const StatusBadge = () => {
  const record = useRecordContext();
  if (!record || !record.status) return null;
  
  const variants = {
    enrolled: 'default',
    active: 'default',
    inactive: 'secondary',
    transferred: 'secondary',
    graduated: 'default',
    dropped: 'destructive',
    suspended: 'destructive',
    completed: 'default',
  } as const;
  
  const colors = {
    enrolled: 'text-blue-700 bg-blue-100',
    active: 'text-green-700 bg-green-100',
    inactive: 'text-muted-foreground bg-muted',
    transferred: 'text-orange-700 bg-orange-100',
    graduated: 'text-purple-700 bg-purple-100',
    dropped: 'text-red-700 bg-red-100',
    suspended: 'text-yellow-700 bg-yellow-100',
    completed: 'text-indigo-700 bg-indigo-100',
  } as const;
  
  return (
    <Badge 
      variant={variants[record.status as keyof typeof variants] || 'default'}
      className={colors[record.status as keyof typeof colors] || ''}
    >
      {record.status}
    </Badge>
  );
};

>>>>>>> origin/main
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
