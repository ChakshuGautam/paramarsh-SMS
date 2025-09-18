"use client";

import { 
  Edit, 
  SimpleForm, 
  TextInput,
  NumberInput,
  SelectInput,
  DateInput,
  ReferenceInput,
  AutocompleteInput,
  required
} from "@/components/admin";
import { 
  ArrayField,
  Datagrid,
  TextField,
  FunctionField,
  Labeled
} from "react-admin";

export const PaymentsEdit = () => (
  <Edit>
    <SimpleForm className="max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReferenceInput reference="invoices" source="invoiceId" label="Invoice">
          <AutocompleteInput 
            optionText={(record) => `Invoice #${record.id} - ₹${record.amount} (${record.period})`}
            placeholder="Search for invoice (e.g. Invoice #123)"
            validate={required()}
          />
        </ReferenceInput>
        <NumberInput 
          source="amount" 
          label="Payment Amount (₹)" 
          placeholder="e.g. 5000.00"
          validate={required()}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectInput 
          source="status" 
          label="Payment Status" 
          placeholder="Select payment status"
          choices={[
            { id: 'pending', name: 'Pending' },
            { id: 'processing', name: 'Processing' },
            { id: 'completed', name: 'Completed' },
            { id: 'failed', name: 'Failed' },
            { id: 'cancelled', name: 'Cancelled' },
            { id: 'refunded', name: 'Refunded' }
          ]}
          validate={required()}
        />
        <SelectInput 
          source="method" 
          label="Payment Method" 
          placeholder="Select payment method"
          choices={[
            { id: 'cash', name: 'Cash' },
            { id: 'card', name: 'Debit/Credit Card' },
            { id: 'netbanking', name: 'Net Banking' },
            { id: 'upi', name: 'UPI' },
            { id: 'cheque', name: 'Cheque' },
            { id: 'bank_transfer', name: 'Bank Transfer' },
            { id: 'wallet', name: 'Digital Wallet' }
          ]}
          validate={required()}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectInput 
          source="gateway" 
          label="Payment Gateway" 
          placeholder="Select payment gateway"
          choices={[
            { id: 'razorpay', name: 'Razorpay' },
            { id: 'paytm', name: 'Paytm' },
            { id: 'phonepe', name: 'PhonePe' },
            { id: 'googlepay', name: 'Google Pay' },
            { id: 'payu', name: 'PayU' },
            { id: 'ccavenue', name: 'CCAvenue' },
            { id: 'manual', name: 'Manual Entry' }
          ]}
        />
        <TextInput 
          source="reference" 
          label="Transaction Reference" 
          placeholder="e.g. TXN123456789, CHQ001234"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput 
          source="paidAt" 
          label="Payment Date" 
          placeholder="Select payment date"
        />
        <TextInput 
          source="receiptNumber" 
          label="Receipt Number" 
          placeholder="e.g. RCP-2024-001"
        />
      </div>

      <TextInput 
        source="notes" 
        label="Payment Notes" 
        placeholder="e.g. Late fee waived, partial payment for monthly fee"
        multiline 
        className="col-span-full"
      />

      <Labeled label="Invoice Details" className="col-span-full">
        <ArrayField source="invoice">
          <Datagrid bulkActionButtons={false} className="overflow-x-auto">
            <FunctionField
              label="Student"
              render={(record: any) => {
                if (!record.student) return '-';
                return `${record.student.firstName} ${record.student.lastName}`;
              }}
            />
            <TextField source="period" label="Billing Period" />
            <TextField source="amount" label="Invoice Amount (₹)" />
            <FunctionField
              label="Due Date"
              render={(record: any) => {
                if (!record.dueDate) return '-';
                return new Date(record.dueDate).toLocaleDateString('en-IN');
              }}
            />
            <FunctionField
              label="Status"
              render={(record: any) => (
                <span className={
                  record.status === 'paid' ? 'text-green-600 font-medium' : 
                  record.status === 'overdue' ? 'text-red-600 font-medium' : 
                  'text-yellow-600 font-medium'
                }>
                  {record.status || 'Unknown'}
                </span>
              )}
            />
          </Datagrid>
        </ArrayField>
      </Labeled>

      <Labeled label="Payment History" className="col-span-full">
        <ArrayField source="invoice.payments">
          <Datagrid bulkActionButtons={false} className="overflow-x-auto">
            <TextField source="amount" label="Amount (₹)" />
            <FunctionField
              label="Date"
              render={(record: any) => {
                if (!record.paidAt) return '-';
                return new Date(record.paidAt).toLocaleDateString('en-IN');
              }}
            />
            <TextField source="method" label="Method" />
            <TextField source="reference" label="Reference" className="hidden sm:table-cell" />
            <FunctionField
              label="Status"
              render={(record: any) => (
                <span className={
                  record.status === 'completed' ? 'text-green-600 font-medium' : 
                  record.status === 'failed' ? 'text-red-600 font-medium' : 
                  'text-yellow-600 font-medium'
                }>
                  {record.status || 'Unknown'}
                </span>
              )}
            />
          </Datagrid>
        </ArrayField>
      </Labeled>
    </SimpleForm>
  </Edit>
);

export default PaymentsEdit;