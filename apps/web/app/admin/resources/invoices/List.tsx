"use client";

import { useListContext } from "ra-core";
import {
  List,
  DataTable,
  TextField,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  DateRangeInput,
  NumberInput,
  Count,
} from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Store keys for different tab states
const storeKeyByStatus = {
  pending: "invoices.list.pending",
  paid: "invoices.list.paid",
  overdue: "invoices.list.overdue",
  cancelled: "invoices.list.cancelled",
};

// Label-less filters with placeholders
const filters = [
  <TextInput source="q" placeholder="Search invoices..." label="" alwaysOn />,
  <ReferenceInput source="studentId" reference="students">
    <AutocompleteInput 
      placeholder="Filter by student" 
      label=""
      optionText={(record: any) => `${record.firstName} ${record.lastName}`}
    />
  </ReferenceInput>,
  <DateRangeInput 
    source="dueDate"
    sourceFrom="dueDate_gte"
    sourceTo="dueDate_lte"
    label=""
    placeholder="Filter by due date"
  />,
  <NumberInput source="amount_gte" placeholder="Min amount" label="" min={0} />,
  <NumberInput source="amount_lte" placeholder="Max amount" label="" min={0} />,
];

export const InvoicesList = () => (
  <List
    sort={{ field: "dueDate", order: "DESC" }}
    filterDefaultValues={{ status: "pending" }}
    filters={filters}
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
    <Tabs value={filterValues.status ?? "pending"} className="mb-4">
      <TabsList className="w-full">
        <TabsTrigger value="pending" onClick={handleChange("pending")}>
          Pending
          <Badge variant="outline" className="ml-2 hidden md:inline-flex">
            <Count filter={{ ...filterValues, status: "pending" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="paid" onClick={handleChange("paid")}>
          Paid
          <Badge variant="outline" className="ml-2 hidden md:inline-flex">
            <Count filter={{ ...filterValues, status: "paid" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="overdue" onClick={handleChange("overdue")}>
          Overdue
          <Badge variant="outline" className="ml-2 hidden md:inline-flex">
            <Count filter={{ ...filterValues, status: "overdue" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="cancelled" onClick={handleChange("cancelled")}>
          Cancelled
          <Badge variant="outline" className="ml-2 hidden md:inline-flex">
            <Count filter={{ ...filterValues, status: "cancelled" }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="pending">
        <InvoicesTable storeKey={storeKeyByStatus.pending} />
      </TabsContent>
      <TabsContent value="paid">
        <InvoicesTable storeKey={storeKeyByStatus.paid} />
      </TabsContent>
      <TabsContent value="overdue">
        <InvoicesTable storeKey={storeKeyByStatus.overdue} />
      </TabsContent>
      <TabsContent value="cancelled">
        <InvoicesTable storeKey={storeKeyByStatus.cancelled} />
      </TabsContent>
    </Tabs>
  );
};

const InvoicesTable = ({ storeKey }: { storeKey: string }) => {
  const listContext = useListContext();
  const data = listContext.data || [];
  
  // Status-based row styling
  const getRowClassName = (record: any) => {
    switch (record.status) {
      case 'pending':
        return 'border-l-4 border-l-yellow-500';
      case 'paid':
        return 'border-l-4 border-l-green-500';
      case 'overdue':
        return 'border-l-4 border-l-red-500';
      case 'cancelled':
        return 'border-l-4 border-l-gray-400';
      default:
        return '';
    }
  };
  
  return (
    <DataTable storeKey={storeKey} rowClassName={getRowClassName}>
      {/* Always visible columns */}
      <DataTable.Col source="id" label="Invoice #" />
      <DataTable.Col label="Student">
        <ReferenceField reference="students" source="studentId">
          <TextField source="firstName" />
        </ReferenceField>
      </DataTable.Col>
      <DataTable.NumberCol 
        source="amount" 
        label="Amount"
        options={{ style: "currency", currency: "INR" }}
      />
      
      {/* Desktop-only columns */}
      <DataTable.Col source="period" label="Period" className="hidden md:table-cell" />
      <DataTable.Col source="dueDate" label="Due Date" className="hidden lg:table-cell" />
      
      {/* Status badge */}
      <DataTable.Col source="status" label="Status">
        <StatusBadge />
      </DataTable.Col>
    </DataTable>
  );
};

const StatusBadge = ({ record }: { record?: any }) => {
  if (!record) return null;
  
  const variants: Record<string, string> = {
    pending: 'warning',
    paid: 'success',
    overdue: 'destructive',
    cancelled: 'secondary',
  };
  
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    paid: 'bg-green-100 text-green-800 border-green-300',
    overdue: 'bg-red-100 text-red-800 border-red-300',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
  };
  
  return (
    <Badge className={cn('capitalize', colors[record.status] || '')}>
      {record.status}
    </Badge>
  );
};

export default InvoicesList;