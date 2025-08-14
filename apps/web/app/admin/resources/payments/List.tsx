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
  SelectInput,
  NumberInput,
  DateInput,
  Count,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Building, DollarSign } from "lucide-react";

// Store keys for different status tabs
const storeKeyByStatus = {
  pending: "payments.list.pending",
  successful: "payments.list.successful",
  failed: "payments.list.failed",
  refunded: "payments.list.refunded",
};

// Label-less filters with placeholders
const paymentFilters = [
  <TextInput source="q" placeholder="Search payments..." label={false} alwaysOn />,
  <ReferenceInput source="invoiceId" reference="invoices">
    <AutocompleteInput placeholder="Filter by invoice" label={false} optionText="id" />
  </ReferenceInput>,
  <SelectInput 
    source="method" 
    placeholder="Filter by method" 
    label={false} 
    choices={[
      { id: 'cash', name: 'Cash' },
      { id: 'card', name: 'Card' },
      { id: 'upi', name: 'UPI' },
      { id: 'bank_transfer', name: 'Bank Transfer' },
      { id: 'cheque', name: 'Cheque' },
      { id: 'online', name: 'Online' }
    ]} 
  />,
  <NumberInput source="amount_gte" placeholder="Min amount" label={false} />,
  <DateInput source="createdAt_gte" placeholder="From date" label={false} />,
];

export const PaymentsList = () => (
  <List
    sort={{ field: "createdAt", order: "DESC" }}
    filterDefaultValues={{ status: "successful" }}
    filters={paymentFilters}
    perPage={25}
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
    <Tabs value={filterValues.status ?? "successful"}>
      <TabsList>
        <TabsTrigger value="pending" onClick={handleChange("pending")}>
          Pending
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "pending" }} />
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="successful" onClick={handleChange("successful")}>
          Successful
          <Badge variant="outline" className="ml-2">
            <Count filter={{ ...filterValues, status: "successful" }} />
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
      </TabsContent>
      <TabsContent value="successful">
        <PaymentsTable storeKey={storeKeyByStatus.successful} />
      </TabsContent>
      <TabsContent value="failed">
        <PaymentsTable storeKey={storeKeyByStatus.failed} />
      </TabsContent>
      <TabsContent value="refunded">
        <PaymentsTable storeKey={storeKeyByStatus.refunded} />
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
        successful: 'border-l-4 border-l-green-500',
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
        <TextField source="id" />
      </ReferenceField>
    </DataTable.Col>
    <DataTable.Col source="createdAt" label="Date" className="hidden lg:table-cell" />
    <DataTable.Col source="id" label="ID" className="hidden lg:table-cell" />
  </DataTable>
);

const StatusBadge = ({ record }: { record?: any }) => {
  if (!record) return null;
  
  const variants = {
    pending: 'warning',
    successful: 'default',
    failed: 'destructive',
    refunded: 'secondary',
  } as const;
  
  return (
    <Badge variant={variants[record.status as keyof typeof variants] || 'default'}>
      {record.status}
    </Badge>
  );
};

const AmountBadge = ({ record }: { record?: any }) => {
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
      <DollarSign className="w-4 h-4 text-green-600" />
      <Badge className={getAmountColor()}>
        ₹{amount.toLocaleString()}
      </Badge>
    </div>
  );
};

const MethodIcon = ({ record }: { record?: any }) => {
  if (!record) return null;
  
  const icons = {
    cash: <DollarSign className="w-4 h-4" />,
    card: <CreditCard className="w-4 h-4" />,
    upi: <Smartphone className="w-4 h-4" />,
    bank_transfer: <Building className="w-4 h-4" />,
    cheque: <Building className="w-4 h-4" />,
    online: <CreditCard className="w-4 h-4" />,
  };
  
  const colors = {
    cash: 'text-green-600',
    card: 'text-blue-600',
    upi: 'text-purple-600',
    bank_transfer: 'text-orange-600',
    cheque: 'text-gray-600',
    online: 'text-indigo-600',
  };
  
  return (
    <div className={`flex items-center gap-2 ${colors[record.method] || 'text-gray-600'}`}>
      {icons[record.method] || <DollarSign className="w-4 h-4" />}
      <span className="capitalize">{record.method?.replace('_', ' ')}</span>
    </div>
  );
};

export default PaymentsList;
