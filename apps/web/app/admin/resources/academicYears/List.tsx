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
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const AcademicYearsList = () => {
  return (
    <List
      perPage={10}
      sort={{ field: "startDate", order: "DESC" }}
      pagination={false}
    >
      <div className="flex flex-row gap-4 mb-4">
        <SidebarFilters />
        <div className="flex-1">
          <DataTable>
            <DataTable.Col source="name" label="Academic Year">
              <AcademicYearName />
            </DataTable.Col>
            <DataTable.Col source="startDate" label="Start Date">
              <DateDisplay source="startDate" />
            </DataTable.Col>
            <DataTable.Col source="endDate" label="End Date">
              <DateDisplay source="endDate" />
            </DataTable.Col>
            <DataTable.Col source="terms" label="Terms" className="hidden md:table-cell">
              <TermsDisplay />
            </DataTable.Col>
            <DataTable.Col source="isActive" label="Status">
              <ActiveStatus />
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
        icon={<CheckCircle size={16} />}
        label="Status"
      >
        <ToggleFilterButton
          label="Active"
          value={{ isActive: true }}
        />
        <ToggleFilterButton
          label="Inactive"
          value={{ isActive: false }}
        />
      </FilterCategory>
      <FilterCategory
        icon={<Clock size={16} />}
        label="Period"
      >
        <ToggleFilterButton
          label="Current Year"
          value={{
            startDate_lte: new Date().toISOString(),
            endDate_gte: new Date().toISOString(),
          }}
        />
        <ToggleFilterButton
          label="Past Years"
          value={{
            endDate_lt: new Date().toISOString(),
          }}
        />
        <ToggleFilterButton
          label="Future Years"
          value={{
            startDate_gt: new Date().toISOString(),
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

const AcademicYearName = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium">{record.name}</span>
    </div>
  );
};

const DateDisplay = ({ source }: { source: string }) => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <span className="text-sm">
      {formatDate(record[source])}
    </span>
  );
};

const TermsDisplay = () => {
  const record = useRecordContext();
  if (!record?.terms || record.terms.length === 0) {
    return <span className="text-muted-foreground">No terms defined</span>;
  }
  
  return (
    <div className="flex gap-1">
      {record.terms.map((term: any, index: number) => (
        <Badge key={index} variant="outline" className="text-xs">
          {term.name}
        </Badge>
      ))}
    </div>
  );
};

const ActiveStatus = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  if (record.isActive) {
    return (
      <Badge className="bg-green-100 text-green-700 flex items-center gap-1 w-fit">
        <CheckCircle className="h-3 w-3" />
        Active
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="flex items-center gap-1 w-fit">
      <XCircle className="h-3 w-3" />
      Inactive
    </Badge>
  );
};


export default AcademicYearsList;
