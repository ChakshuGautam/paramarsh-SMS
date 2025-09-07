"use client";

import { useListContext, useRecordContext } from "ra-core";
import {
  DataTable,
  List,
  ReferenceField,
  TextField,
  Count,
  TextInput,
  SelectInput,
  NumberInput,
  DateInput,
  ListPagination,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Building, IndianRupee } from "lucide-react";

// Store keys for different status tabs
const storeKeyByStatus = {
  pending: "payments.list.pending",
  successful: "payments.list.successful",
  failed: "payments.list.failed",
  refunded: "payments.list.refunded",
};

// Standardized filters using filter components
const paymentFilters = [
  <TextInput source="q" placeholder="Search payments..." label="" alwaysOn />,
  <SelectInput
    source="invoiceId"
    placeholder="Filter by invoice"
    label=""
    choices={[]} // Would need to be populated with invoice data
  />,
  <SelectInput 
    source="method" 
    placeholder="Filter by payment method" 
    label=""
    choices={[
      { id: 'cash', name: 'Cash' },
      { id: 'card', name: 'Card' },
      { id: 'upi', name: 'UPI' },
      { id: 'bank_transfer', name: 'Bank Transfer' },
      { id: 'cheque', name: 'Cheque' },
      { id: 'online', name: 'Online' }
    ]}
  />,
  <NumberInput source="amount_gte" placeholder="Min amount" label="" />,
  <DateInput source="createdAt_gte" placeholder="From date" label="" />,
];

export const PaymentsList = () => (
  <List
    sort={{ field: "createdAt", order: "DESC" }}
    filterDefaultValues={{ status: "success" }}
    filters={paymentFilters}
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
    <Tabs value={filterValues.status ?? "success"}>
      <TabsList>
        <TabsTrigger value="pending" onClick={handleChange("pending")}>
          Pending
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "pending" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="success" onClick={handleChange("success")}>
          Successful
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "success" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="failed" onClick={handleChange("failed")}>
          Failed
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "failed" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="refunded" onClick={handleChange("refunded")}>
          Refunded
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "refunded" }} />
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="pending">
        <PaymentsTable storeKey={storeKeyByStatus.pending} />
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
      <TabsContent value="success">
        <PaymentsTable storeKey={storeKeyByStatus.successful} />
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
      <TabsContent value="failed">
        <PaymentsTable storeKey={storeKeyByStatus.failed} />
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
      <TabsContent value="refunded">
        <PaymentsTable storeKey={storeKeyByStatus.refunded} />
        <ListPagination className="justify-start mt-2" />
      </TabsContent>
    </Tabs>
  );
};

const PaymentsTable = ({ storeKey }: { storeKey: string }) => (
  <DataTable 
    storeKey={storeKey}
    rowClassName={(record) => {
      const statusColors = {
        pending: 'border-l-4 border-l-yellow-500',
        success: 'border-l-4 border-l-green-500',
        failed: 'border-l-4 border-l-red-500',
        refunded: 'border-l-4 border-l-orange-500',
      };
      return statusColors[record.status] || '';
    }}
  >
    {/* Always visible columns */}
    <DataTable.Col source="amount" label="Amount">
      <AmountBadge />
    </DataTable.Col>
    <DataTable.Col source="status" label="Status">
      <StatusBadge />
    </DataTable.Col>
    <DataTable.Col source="method" label="Method">
      <MethodIcon />
    </DataTable.Col>
    
    {/* Desktop-only columns */}
    <DataTable.Col label="Invoice" className="hidden md:table-cell">
      <ReferenceField reference="invoices" source="invoiceId">
        <TextField source="invoiceNumber" />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.Col source="createdAt" label="Date" className="hidden lg:table-cell" />
  </DataTable>
);

const StatusBadge = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  const variants = {
    pending: 'warning',
    success: 'default',
    failed: 'destructive',
    refunded: 'secondary',
  } as const;
  
  return (
    <Badge variant={variants[record.status as keyof typeof variants] || 'default'}>
      {record.status}
    </Badge>
  );
};

const AmountBadge = () => {
  const record = useRecordContext();
  if (!record || !record.amount) return null;
  
  const amount = parseFloat(record.amount);
  const getAmountColor = () => {
    if (amount >= 10000) return 'text-purple-700 bg-purple-100';
    if (amount >= 5000) return 'text-blue-700 bg-blue-100';
    if (amount >= 1000) return 'text-green-700 bg-green-100';
    return 'text-gray-700 bg-gray-100';
  };
  
  return (
    <div className="flex items-center gap-2">
      <IndianRupee className="w-4 h-4 text-green-600" />
      <Badge className={getAmountColor()}>
        ₹{amount.toLocaleString()}
      </Badge>
    </div>
  );
};

const MethodIcon = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  const icons = {
    cash: <IndianRupee className="w-4 h-4" />,
    card: <CreditCard className="w-4 h-4" />,
    upi: <Smartphone className="w-4 h-4" />,
    bank_transfer: <Building className="w-4 h-4" />,
    cheque: <Building className="w-4 h-4" />,
    online: <CreditCard className="w-4 h-4" />,
    offline: <IndianRupee className="w-4 h-4" />,
    neft: <Building className="w-4 h-4" />,
  };
  
  const colors = {
    cash: 'text-green-600',
    card: 'text-blue-600',
    upi: 'text-purple-600',
    bank_transfer: 'text-orange-600',
    cheque: 'text-gray-600',
    online: 'text-indigo-600',
    offline: 'text-gray-600',
    neft: 'text-orange-600',
  };
  
  return (
    <div className={`flex items-center gap-2 ${colors[record.method] || 'text-gray-600'}`}>
      {icons[record.method] || <IndianRupee className="w-4 h-4" />}
      <span className="capitalize">{record.method?.replace('_', ' ')}</span>
    </div>
  );
};

export default PaymentsList;
