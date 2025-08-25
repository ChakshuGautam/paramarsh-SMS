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
  ToggleFilterButton,
  TextInput,
  ListPagination,
  GenderBadge,
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { User, BookOpen, Users } from "lucide-react";
import { getStatusColor } from "@/lib/theme/colors";

export const StudentsList = () => {
  return (
    <List
      perPage={25}
      sort={{ field: "firstName", order: "ASC" }}
      pagination={false}
    >
      <div className="flex flex-row gap-4 mb-4">
        <SidebarFilters />
        <div className="flex-1">
          <DataTable>
            <DataTable.Col source="admissionNo" label="Admission No" />
            <DataTable.Col source="firstName" label="First Name" />
            <DataTable.Col source="lastName" label="Last Name" />
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

=======
  TextInput,
  SelectInput,
  Count,
} from "@/components/admin";
import { ClassFilter, SectionFilter } from "@/components/admin/dependent-filters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Store keys for different status tabs
const storeKeyByStatus = {
  active: "students.list.active",
  inactive: "students.list.inactive",
  graduated: "students.list.graduated",
};

// Enhanced filters with dependency logic
const studentFilters = [
  <TextInput key="search" source="q" placeholder="Search students..." label="" alwaysOn />,
  <ClassFilter key="class" source="classId" placeholder="Filter by class" />,
  <SectionFilter 
    key="section"
    source="sectionId" 
    classIdSource="classId"
    placeholder="Filter by section"
    showUnique={true}
    hideUntilClassSelected={true}
  />,
  <SelectInput 
    key="gender"
    source="gender" 
    placeholder="Filter by gender" 
    label="" 
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
>>>>>>> origin/main

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

<<<<<<< HEAD
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
=======
const StudentsTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
    storeKey={storeKey}
    rowClassName={(record) => {
      const statusColors = {
        active: 'border-l-4 border-l-green-500',
        inactive: 'border-l-4 border-l-muted-foreground',
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
    <DataTable.Col label="Guardian Phone" className="hidden lg:table-cell">
      <GuardianPhones />
    </DataTable.Col>
  </DataTable>
);

export default StudentsList;
>>>>>>> origin/main
