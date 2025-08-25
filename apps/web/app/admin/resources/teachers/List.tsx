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
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { User, BookOpen, GraduationCap, Calendar, Award } from "lucide-react";
import { getExperienceColor } from "@/lib/theme/colors";
import { parseFlexibleArray } from "@/lib/utils/parse-utils";

export const TeachersList = () => {
  return (
    <List
      perPage={25}
      sort={{ field: "experienceYears", order: "DESC" }}
      pagination={false}
    >
      <div className="flex flex-row gap-4 mb-4">
        <SidebarFilters />
        <div className="flex-1">
          <DataTable>
            <DataTable.Col label="Staff Member">
              <StaffMemberDisplay />
            </DataTable.Col>
            <DataTable.Col source="subjects" label="Subjects">
              <SubjectsBadge />
            </DataTable.Col>
            <DataTable.Col source="experienceYears" label="Experience">
              <ExperienceBadge />
            </DataTable.Col>
            <DataTable.Col 
              source="qualifications" 
              label="Qualifications" 
              className="hidden md:table-cell"
            >
              <QualificationsBadge />
            </DataTable.Col>
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
        icon={<Calendar size={16} />}
        label="Experience Level"
      >
        <ToggleFilterButton
          label="Novice (0-3 years)"
          value={{
            experienceYears_gte: 0,
            experienceYears_lte: 3,
          }}
        />
        <ToggleFilterButton
          label="Experienced (4-10 years)"
          value={{
            experienceYears_gte: 4,
            experienceYears_lte: 10,
          }}
        />
        <ToggleFilterButton
          label="Senior (11+ years)"
          value={{
            experienceYears_gte: 11,
            experienceYears_lte: undefined,
          }}
        />
      </FilterCategory>
      <FilterCategory
        icon={<BookOpen size={16} />}
        label="Common Subjects"
      >
        <ToggleFilterButton
          label="Mathematics"
          value={{ subjects: "Mathematics" }}
        />
        <ToggleFilterButton
          label="English"
          value={{ subjects: "English" }}
        />
        <ToggleFilterButton
          label="Science"
          value={{ subjects: "Science" }}
        />
        <ToggleFilterButton
          label="Social Studies"
          value={{ subjects: "Social Studies" }}
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
=======
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  NumberInput,
  Count,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, BookOpen, Award, GraduationCap, Calendar } from "lucide-react";

// Store keys for different experience levels
const storeKeyByExperience = {
  novice: "teachers.list.novice",
  experienced: "teachers.list.experienced",
  senior: "teachers.list.senior",
  all: "teachers.list.all",
};

// Helper function to get experience level filters
const getExperienceFilter = (level: string) => {
  switch (level) {
    case "novice":
      return { experienceYears_lte: 3 };
    case "experienced":
      return { experienceYears_gte: 4, experienceYears_lte: 10 };
    case "senior":
      return { experienceYears_gte: 11 };
    default:
      return {};
  }
};

// Label-less filters with placeholders
const teacherFilters = [
  <TextInput source="q" placeholder="Search teachers..." label="" alwaysOn />,
  <ReferenceInput source="staffId" reference="staff">
    <AutocompleteInput 
      placeholder="Filter by staff member" 
      label="" 
      optionText={(record) => `${record.firstName} ${record.lastName}`}
    />
  </ReferenceInput>,
  <TextInput source="subjects" placeholder="Filter by subject" label="" />,
  <NumberInput source="experienceYears_gte" placeholder="Min experience (years)" label="" />,
];

export const TeachersList = () => (
  <List
    sort={{ field: "experienceYears", order: "DESC" }}
    filters={teacherFilters}
    perPage={10}
  >
    <TabbedDataTable />
  </List>
);

const TabbedDataTable = () => {
  const listContext = useListContext();
  const { filterValues, setFilters, displayedFilters } = listContext;
  
  const handleChange = (value: string) => () => {
    const experienceFilter = getExperienceFilter(value);
    setFilters({ ...filterValues, ...experienceFilter }, displayedFilters);
  };
  
  // Determine current tab based on filter values
  const getCurrentTab = () => {
    if (filterValues.experienceYears_lte === 3) return "novice";
    if (filterValues.experienceYears_gte === 4 && filterValues.experienceYears_lte === 10) return "experienced";
    if (filterValues.experienceYears_gte === 11) return "senior";
    return "all";
  };
  
  return (
    <Tabs value={getCurrentTab()}>
      <TabsList>
        <TabsTrigger value="novice" onClick={handleChange("novice")}>
          Novice (0-3 years)
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getExperienceFilter("novice") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="experienced" onClick={handleChange("experienced")}>
          Experienced (4-10 years)
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getExperienceFilter("experienced") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="senior" onClick={handleChange("senior")}>
          Senior (11+ years)
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getExperienceFilter("senior") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="all" onClick={handleChange("all")}>
          All Teachers
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getExperienceFilter("all") }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="novice">
        <TeachersTable storeKey={storeKeyByExperience.novice} />
      </TabsContent>
      <TabsContent value="experienced">
        <TeachersTable storeKey={storeKeyByExperience.experienced} />
      </TabsContent>
      <TabsContent value="senior">
        <TeachersTable storeKey={storeKeyByExperience.senior} />
      </TabsContent>
      <TabsContent value="all">
        <TeachersTable storeKey={storeKeyByExperience.all} />
      </TabsContent>
    </Tabs>
  );
};

const TeachersTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
    storeKey={storeKey}
    rowClassName={(record) => {
      const experienceColors = {
        novice: 'border-l-4 border-l-blue-400',
        experienced: 'border-l-4 border-l-green-500',
        senior: 'border-l-4 border-l-purple-500',
      };
      
      const getExperienceLevel = (years: number) => {
        if (years <= 3) return 'novice';
        if (years <= 10) return 'experienced';
        return 'senior';
      };
      
      return experienceColors[getExperienceLevel(record.experienceYears)] || '';
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col label="Staff Member">
      <StaffMemberDisplay />
    </DataTable.Col>
    <DataTable.Col source="subjects" label="Subjects">
      <SubjectsBadge />
    </DataTable.Col>
    <DataTable.Col source="experienceYears" label="Experience">
      <ExperienceBadge />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
    <DataTable.Col source="qualifications" label="Qualifications" className="hidden md:table-cell">
      <QualificationsBadge />
    </DataTable.Col>
    <DataTable.Col source="id" label="ID" className="hidden lg:table-cell" />
  </DataTable>
>>>>>>> origin/main
);

const StaffMemberDisplay = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <ReferenceField reference="staff" source="staffId" link={false}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-muted rounded-full">
          <User className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            <TextField source="firstName" /> <TextField source="lastName" />
          </span>
          <span className="text-xs text-muted-foreground">
            <TextField source="email" />
          </span>
          <span className="text-xs text-muted-foreground">
            Staff ID: <TextField source="employeeId" />
          </span>
        </div>
      </div>
    </ReferenceField>
  );
};

const ExperienceBadge = () => {
  const record = useRecordContext();
  if (!record || record.experienceYears === null || record.experienceYears === undefined) {
<<<<<<< HEAD
    return <span className="text-muted-foreground">No experience data</span>;
  }
  
  const experienceColorConfig = getExperienceColor(record.experienceYears);
=======
    return <span className="text-muted-foreground text-sm">No data</span>;
  }
  
  const getExperienceColor = (years: number) => {
    if (years <= 3) return 'text-blue-700 bg-blue-100';
    if (years <= 10) return 'text-green-700 bg-green-100';
    return 'text-purple-700 bg-purple-100';
  };
>>>>>>> origin/main
  
  const getExperienceLevel = (years: number) => {
    if (years <= 3) return 'Novice';
    if (years <= 10) return 'Experienced';
    return 'Senior';
  };
  
  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-muted-foreground" />
<<<<<<< HEAD
      <Badge className={`${experienceColorConfig.background} ${experienceColorConfig.text}`}>
=======
      <Badge className={getExperienceColor(record.experienceYears)}>
>>>>>>> origin/main
        {record.experienceYears} year{record.experienceYears !== 1 ? 's' : ''}
      </Badge>
      <span className="text-xs text-muted-foreground">
        ({getExperienceLevel(record.experienceYears)})
      </span>
    </div>
  );
};

const SubjectsBadge = () => {
  const record = useRecordContext();
  if (!record || !record.subjects) {
<<<<<<< HEAD
    return <span className="text-muted-foreground">No subjects</span>;
  }
  
  // Use parseFlexibleArray utility instead of duplicate logic
  const subjects = parseFlexibleArray(record.subjects);
  
  if (subjects.length === 0) {
    return <span className="text-muted-foreground">No subjects</span>;
=======
    return <span className="text-muted-foreground text-sm">No subjects assigned</span>;
  }
  
  // Handle subjects whether it's a string, array, or JSON string
  let subjects: string[] = [];
  
  if (typeof record.subjects === 'string') {
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(record.subjects);
      subjects = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // If not JSON, treat as comma-separated string
      subjects = record.subjects.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  } else if (Array.isArray(record.subjects)) {
    subjects = record.subjects;
  }
  
  if (subjects.length === 0) {
    return <span className="text-muted-foreground text-sm">No subjects assigned</span>;
>>>>>>> origin/main
  }
  
  return (
    <div className="flex items-center gap-2">
      <BookOpen className="w-4 h-4 text-muted-foreground" />
      <div className="flex flex-wrap gap-1">
        {subjects.slice(0, 2).map((subject: string, index: number) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {subject}
          </Badge>
        ))}
        {subjects.length > 2 && (
          <Badge variant="outline" className="text-xs">
            +{subjects.length - 2} more
          </Badge>
        )}
      </div>
    </div>
  );
};

const QualificationsBadge = () => {
  const record = useRecordContext();
  if (!record || !record.qualifications) {
<<<<<<< HEAD
    return <span className="text-muted-foreground">No qualifications</span>;
  }
  
  // Use parseFlexibleArray utility instead of manual parsing
  const qualifications = parseFlexibleArray(record.qualifications);
  
  if (qualifications.length === 0) {
    return <span className="text-muted-foreground">No qualifications</span>;
=======
    return <span className="text-muted-foreground text-sm">No qualifications</span>;
  }
  
  // Handle qualifications whether it's a string, array, or JSON string
  let qualifications: string[] = [];
  
  if (typeof record.qualifications === 'string') {
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(record.qualifications);
      qualifications = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // If not JSON, treat as comma-separated string
      qualifications = record.qualifications.split(',').map((q: string) => q.trim()).filter(Boolean);
    }
  } else if (Array.isArray(record.qualifications)) {
    qualifications = record.qualifications;
  }
  
  if (qualifications.length === 0) {
    return <span className="text-muted-foreground text-sm">No qualifications</span>;
>>>>>>> origin/main
  }
  
  return (
    <div className="flex items-center gap-2">
      <GraduationCap className="w-4 h-4 text-muted-foreground" />
      <div className="flex flex-wrap gap-1">
        {qualifications.map((qual: string, index: number) => (
          <Badge key={index} className="text-xs text-indigo-700 bg-indigo-100">
            {qual}
          </Badge>
        ))}
      </div>
    </div>
  );
};

<<<<<<< HEAD

=======
>>>>>>> origin/main
export default TeachersList;
