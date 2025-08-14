"use client";

import { useListContext } from "ra-core";
import {
  DataTable,
  List,
  ReferenceField,
  TextField,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  NumberInput,
  Count,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
  <TextInput source="q" placeholder="Search teachers..." label={false} alwaysOn />,
  <ReferenceInput source="staffId" reference="staff">
    <AutocompleteInput 
      placeholder="Filter by staff member" 
      label={false} 
      optionText={(record) => `${record.firstName} ${record.lastName}`}
    />
  </ReferenceInput>,
  <TextInput source="subjects" placeholder="Filter by subject" label={false} />,
  <NumberInput source="experienceYears_gte" placeholder="Min experience (years)" label={false} />,
];

export const TeachersList = () => (
  <List
    sort={{ field: "experienceYears", order: "DESC" }}
    filters={teacherFilters}
    perPage={25}
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
      <ReferenceField reference="staff" source="staffId">
        <TextField source="firstName" />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.Col source="subjects" label="Subjects">
      <SubjectsBadge />
    </DataTable.Col>
    <DataTable.Col source="experienceYears" label="Experience">
      <ExperienceBadge />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
    <DataTable.Col source="qualifications" label="Qualifications" className="hidden md:table-cell" />
    <DataTable.Col source="id" label="ID" className="hidden lg:table-cell" />
  </DataTable>
);

const ExperienceBadge = ({ record }: { record?: any }) => {
  if (!record) return null;
  
  const getExperienceColor = (years: number) => {
    if (years <= 3) return 'text-blue-700 bg-blue-100';
    if (years <= 10) return 'text-green-700 bg-green-100';
    return 'text-purple-700 bg-purple-100';
  };
  
  const getExperienceLevel = (years: number) => {
    if (years <= 3) return 'Novice';
    if (years <= 10) return 'Experienced';
    return 'Senior';
  };
  
  return (
    <Badge className={getExperienceColor(record.experienceYears)}>
      {record.experienceYears} years ({getExperienceLevel(record.experienceYears)})
    </Badge>
  );
};

const SubjectsBadge = ({ record }: { record?: any }) => {
  if (!record || !record.subjects) return null;
  
  // Assuming subjects is a comma-separated string or array
  const subjects = Array.isArray(record.subjects) 
    ? record.subjects 
    : record.subjects.split(',').map((s: string) => s.trim());
  
  if (subjects.length === 0) return null;
  
  return (
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
  );
};

export default TeachersList;
