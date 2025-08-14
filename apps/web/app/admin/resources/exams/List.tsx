"use client";

import { useListContext } from "ra-core";
import {
  DataTable,
  List,
  TextInput,
  DateRangeInput,
  Count,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, isBefore, isWithinInterval } from "date-fns";

// Store keys for different time periods
const storeKeyByPeriod = {
  upcoming: "exams.list.upcoming",
  ongoing: "exams.list.ongoing",
  completed: "exams.list.completed",
  all: "exams.list.all",
};

// Helper function to get time period filters
const getTimeFilter = (period: string) => {
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  
  switch (period) {
    case "upcoming":
      return { startDate_gt: todayStr };
    case "ongoing":
      return { startDate_lte: todayStr, endDate_gte: todayStr };
    case "completed":
      return { endDate_lt: todayStr };
    default:
      return {};
  }
};

// Label-less filters with placeholders
const examFilters = [
  <TextInput source="q" placeholder="Search exams..." label={false} alwaysOn />,
  <DateRangeInput 
    source="examPeriod"
    sourceFrom="startDate_gte"
    sourceTo="endDate_lte"
    label={false}
    placeholder="Select exam date range"
  />,
];

export const ExamsList = () => (
  <List
    sort={{ field: "startDate", order: "ASC" }}
    filters={examFilters}
    perPage={25}
  >
    <TabbedDataTable />
  </List>
);

const TabbedDataTable = () => {
  const listContext = useListContext();
  const { filterValues, setFilters, displayedFilters } = listContext;
  
  const handleChange = (value: string) => () => {
    const timeFilter = getTimeFilter(value);
    setFilters({ ...filterValues, ...timeFilter }, displayedFilters);
  };
  
  // Determine current tab based on filter values
  const getCurrentTab = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    
    if (filterValues.startDate_gt === today) return "upcoming";
    if (filterValues.startDate_lte === today && filterValues.endDate_gte === today) return "ongoing";
    if (filterValues.endDate_lt === today) return "completed";
    return "all";
  };
  
  return (
    <Tabs value={getCurrentTab()}>
      <TabsList>
        <TabsTrigger value="upcoming" onClick={handleChange("upcoming")}>
          Upcoming
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getTimeFilter("upcoming") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="ongoing" onClick={handleChange("ongoing")}>
          Ongoing
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getTimeFilter("ongoing") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="completed" onClick={handleChange("completed")}>
          Completed
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getTimeFilter("completed") }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="all" onClick={handleChange("all")}>
          All Exams
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, ...getTimeFilter("all") }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming">
        <ExamsTable storeKey={storeKeyByPeriod.upcoming} />
      </TabsContent>
      <TabsContent value="ongoing">
        <ExamsTable storeKey={storeKeyByPeriod.ongoing} />
      </TabsContent>
      <TabsContent value="completed">
        <ExamsTable storeKey={storeKeyByPeriod.completed} />
      </TabsContent>
      <TabsContent value="all">
        <ExamsTable storeKey={storeKeyByPeriod.all} />
      </TabsContent>
    </Tabs>
  );
};

const ExamsTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
    storeKey={storeKey}
    rowClassName={(record) => {
      const today = new Date();
      const startDate = new Date(record.startDate);
      const endDate = new Date(record.endDate);
      
      if (isAfter(startDate, today)) {
        return 'border-l-4 border-l-blue-500'; // upcoming
      } else if (isWithinInterval(today, { start: startDate, end: endDate })) {
        return 'border-l-4 border-l-green-500'; // ongoing
      } else {
        return 'border-l-4 border-l-gray-400'; // completed
      }
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col source="name" label="Exam Name" />
    <DataTable.Col source="startDate" label="Start Date">
      <DateBadge source="startDate" />
    </DataTable.Col>
    <DataTable.Col source="endDate" label="End Date">
      <DateBadge source="endDate" />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
    <DataTable.Col source="id" label="ID" className="hidden lg:table-cell" />
  </DataTable>
);

const DateBadge = ({ record, source }: { record?: any; source: string }) => {
  if (!record || !record[source]) return null;
  
  const date = new Date(record[source]);
  const today = new Date();
  
  const getDateColor = () => {
    if (isAfter(date, today)) return 'text-blue-700 bg-blue-100';
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) return 'text-green-700 bg-green-100';
    return 'text-gray-700 bg-gray-100';
  };
  
  return (
    <Badge className={getDateColor()}>
      {format(date, 'MMM dd, yyyy')}
    </Badge>
  );
};

export default ExamsList;
