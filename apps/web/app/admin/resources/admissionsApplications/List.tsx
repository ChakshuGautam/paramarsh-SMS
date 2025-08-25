"use client";

<<<<<<< HEAD
import type { ReactNode } from "react";
import {
  Translate,
  useTranslate,
  FilterLiveForm,
} from "ra-core";
import { 
  List, 
  DataTable,
  TextInput,
  ToggleFilterButton,
  ListPagination,
} from "@/components/admin";
import { FileCheck, Hash, Calendar } from "lucide-react";

export const AdmissionsApplicationsList = () => (
  <List
    sort={{ field: "submittedAt", order: "DESC" }}
    perPage={25}
    pagination={false}
  >
    <div className="flex flex-row gap-4 mb-4">
      <SidebarFilters />
      <div className="flex-1">
        <DataTable>
          <DataTable.Col source="status" label="Status" />
          <DataTable.Col source="score" label="Score" />
          <DataTable.Col source="submittedAt" label="Submitted" />
        </DataTable>
        <ListPagination className="justify-start mt-2" />
      </div>
    </div>
  </List>
);

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
        icon={<FileCheck size={16} />}
        label="Status"
      >
        <ToggleFilterButton
          label="Submitted"
          value={{ status: "submitted" }}
        />
        <ToggleFilterButton
          label="Under Review"
          value={{ status: "under_review" }}
        />
        <ToggleFilterButton
          label="Accepted"
          value={{ status: "accepted" }}
        />
        <ToggleFilterButton
          label="Rejected"
          value={{ status: "rejected" }}
        />
        <ToggleFilterButton
          label="Waitlisted"
          value={{ status: "waitlisted" }}
        />
      </FilterCategory>
      <FilterCategory
        icon={<Hash size={16} />}
        label="Score Range"
      >
        <FilterLiveForm>
          <TextInput
            source="score_gte"
            placeholder="Min score"
            label=""
            className="mb-2"
          />
        </FilterLiveForm>
        <FilterLiveForm>
          <TextInput
            source="score_lte"
            placeholder="Max score"
            label=""
          />
        </FilterLiveForm>
      </FilterCategory>
      <FilterCategory
        icon={<Calendar size={16} />}
        label="Date Range"
      >
        <FilterLiveForm>
          <TextInput
            source="submittedAt_gte"
            placeholder="From date (YYYY-MM-DD)"
            label=""
            className="mb-2"
          />
        </FilterLiveForm>
        <FilterLiveForm>
          <TextInput
            source="submittedAt_lte"
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
import { List, DataTable } from "@/components/admin";

export const AdmissionsApplicationsList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col source="programId" label="Program" />
      <DataTable.Col source="status" label="Status" />
      <DataTable.Col source="score" label="Score" />
    </DataTable>
  </List>
);

>>>>>>> origin/main
export default AdmissionsApplicationsList;
