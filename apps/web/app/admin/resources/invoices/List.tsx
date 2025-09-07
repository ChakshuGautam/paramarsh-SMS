"use client";

import { useListContext, useRecordContext } from "ra-core";
import {
  List,
  DataTable,
  TextField,
  Count,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  ListPagination,
} from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, Send, Download, Share2 } from "lucide-react";

// Store keys for different tab states
const storeKeyByStatus = {
  pending: "invoices.list.pending",
  paid: "invoices.list.paid",
  overdue: "invoices.list.overdue",
  cancelled: "invoices.list.cancelled",
};

const filters = [
  <TextInput source="q" placeholder="Search" label="" />,
  <ReferenceInput
    source="studentId"
    reference="students"
    sort={{ field: "firstName", order: "ASC" }}
  >
    <AutocompleteInput placeholder="Filter by student" label="" />
  </ReferenceInput>,
];

export const InvoicesList = () => (
  <List
    sort={{ field: "dueDate", order: "DESC" }}
    filterDefaultValues={{ status: "pending" }}
    filters={filters}
    perPage={10}
    pagination={false}
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
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
      <TabsContent value="paid">
        <InvoicesTable storeKey={storeKeyByStatus.paid} />
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
      <TabsContent value="overdue">
        <InvoicesTable storeKey={storeKeyByStatus.overdue} />
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
      <TabsContent value="cancelled">
        <InvoicesTable storeKey={storeKeyByStatus.cancelled} />
        <ListPagination className="justify-start mt-2" />
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
      <DataTable.Col source="invoiceNumber" label="Invoice #" />
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
      
      {/* Action buttons */}
      <DataTable.Col label="Actions" className="hidden md:table-cell">
        <InvoiceActions />
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

const InvoiceActions = () => {
  const record = useRecordContext();
  
  if (!record) return null;
  
  const handleGenerateInvoice = () => {
    // This would typically generate a PDF invoice
    console.log('Generating invoice for:', record.invoiceNumber);
    // In a real app, this would call a backend API to generate PDF
    alert(`Invoice generation for "${record.invoiceNumber}" would be triggered here. A PDF would be generated with all invoice details.`);
  };
  
  const handleShareInvoice = () => {
    // This would typically share the invoice via email/SMS/WhatsApp
    console.log('Sharing invoice:', record.invoiceNumber);
    alert(`Invoice "${record.invoiceNumber}" would be shared with the parent via Email/SMS/WhatsApp. Parents would receive a PDF copy or link to view the invoice.`);
  };
  
  const handleDownloadInvoice = () => {
    // This would download the invoice PDF
    console.log('Downloading invoice:', record.invoiceNumber);
    alert(`Invoice "${record.invoiceNumber}" PDF download would start here.`);
  };
  
  return (
    <div className="flex items-center gap-1">
      {record.status !== 'paid' && record.status !== 'cancelled' && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleGenerateInvoice}
          title="Generate Invoice"
        >
          <FileText className="h-4 w-4" />
        </Button>
      )}
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleDownloadInvoice}
        title="Download Invoice"
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleShareInvoice}
        title="Share Invoice"
        className="text-blue-600 hover:text-blue-700"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default InvoicesList;