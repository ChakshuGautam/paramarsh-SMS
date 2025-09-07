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
  ListPagination,
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { User, BookOpen, GraduationCap, Calendar, Award, Users } from "lucide-react";
import { getExperienceColor } from "@/lib/theme/colors";
import { parseFlexibleArray } from "@/lib/utils/parse-utils";

export const TeachersList = () => {
  return (
    <List
      perPage={10}
      pagination={false}
      sort={{ field: "experienceYears", order: "DESC" }}
    >
      <div className="flex flex-row gap-4 mb-4">
        <SidebarFilters />
        <div className="flex-1">
          <DataTable>
            <DataTable.Col label="Staff Member">
              <StaffMemberDisplay />
            </DataTable.Col>
            <DataTable.Col label="Assigned Classes">
              <AssignedClassesBadge />
            </DataTable.Col>
            <DataTable.Col label="Assigned Sections" className="hidden md:table-cell">
              <AssignedSectionsBadge />
            </DataTable.Col>
            <DataTable.Col source="experienceYears" label="Experience">
              <ExperienceBadge />
            </DataTable.Col>
            <DataTable.Col 
              source="qualifications" 
              label="Qualifications" 
              className="hidden lg:table-cell"
            >
              <QualificationsBadge />
            </DataTable.Col>
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

const StaffMemberDisplay = () => {
  const record = useRecordContext();
  if (!record || !record.staff) return null;
  
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-muted rounded-full">
        <User className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="flex flex-col">
        <span className="font-medium text-foreground">
          {record.staff.firstName} {record.staff.lastName}
        </span>
        <span className="text-xs text-muted-foreground">
          {record.staff.email}
        </span>
        <span className="text-xs text-muted-foreground">
          Staff ID: {record.staff.employeeId || record.staff.id}
        </span>
      </div>
    </div>
  );
};

const ExperienceBadge = () => {
  const record = useRecordContext();
  if (!record || record.experienceYears === null || record.experienceYears === undefined) {
    return <span className="text-muted-foreground">No experience data</span>;
  }
  
  const experienceColorConfig = getExperienceColor(record.experienceYears);
  
  const getExperienceLevel = (years: number) => {
    if (years <= 3) return 'Novice';
    if (years <= 10) return 'Experienced';
    return 'Senior';
  };
  
  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-muted-foreground" />
      <Badge className={`${experienceColorConfig.background} ${experienceColorConfig.text}`}>
        {record.experienceYears} year{record.experienceYears !== 1 ? 's' : ''}
      </Badge>
      <span className="text-xs text-muted-foreground">
        ({getExperienceLevel(record.experienceYears)})
      </span>
    </div>
  );
};

const AssignedClassesBadge = () => {
  const record = useRecordContext();
  if (!record || !record.classIds || record.classIds.length === 0) {
    return <span className="text-muted-foreground">No classes</span>;
  }
  
  // For now, just show the count since we have IDs
  // React Admin will handle fetching the actual class names if needed
  return (
    <div className="flex items-center gap-2">
      <BookOpen className="w-4 h-4 text-muted-foreground" />
      <Badge variant="secondary" className="text-xs">
        {record.classIds.length} class{record.classIds.length !== 1 ? 'es' : ''}
      </Badge>
    </div>
  );
};

const AssignedSectionsBadge = () => {
  const record = useRecordContext();
  if (!record || !record.sectionIds || record.sectionIds.length === 0) {
    return <span className="text-muted-foreground">No sections</span>;
  }
  
  // For now, just show the count since we have IDs
  // React Admin will handle fetching the actual section names if needed
  return (
    <div className="flex items-center gap-2">
      <Users className="w-4 h-4 text-muted-foreground" />
      <Badge variant="outline" className="text-xs">
        {record.sectionIds.length} section{record.sectionIds.length !== 1 ? 's' : ''}
      </Badge>
    </div>
  );
};

const QualificationsBadge = () => {
  const record = useRecordContext();
  if (!record || !record.qualifications) {
    return <span className="text-muted-foreground">No qualifications</span>;
  }
  
  // Use parseFlexibleArray utility instead of manual parsing
  const qualifications = parseFlexibleArray(record.qualifications);
  
  if (qualifications.length === 0) {
    return <span className="text-muted-foreground">No qualifications</span>;
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


export default TeachersList;
