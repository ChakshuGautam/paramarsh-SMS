"use client";

import { 
  Edit, 
  SimpleForm, 
  TextInput, 
  SelectInput,
  DateInput,
  NumberInput,
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

export const InvoicesEdit = () => (
  <Edit>
    <SimpleForm className="max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReferenceInput reference="students" source="studentId" label="Student">
          <AutocompleteInput 
            optionText={(record) => `${record.firstName} ${record.lastName} (${record.admissionNo})`}
            placeholder="Search for student (e.g. Rajesh Kumar)"
            validate={required()}
          />
        </ReferenceInput>
        <SelectInput 
          source="period" 
          label="Period" 
          placeholder="Select billing period"
          choices={[
            { id: 'January 2024', name: 'January 2024' },
            { id: 'February 2024', name: 'February 2024' },
            { id: 'March 2024', name: 'March 2024' },
            { id: 'April 2024', name: 'April 2024' },
            { id: 'May 2024', name: 'May 2024' },
            { id: 'June 2024', name: 'June 2024' },
            { id: 'July 2024', name: 'July 2024' },
            { id: 'August 2024', name: 'August 2024' },
            { id: 'September 2024', name: 'September 2024' },
            { id: 'October 2024', name: 'October 2024' },
            { id: 'November 2024', name: 'November 2024' },
            { id: 'December 2024', name: 'December 2024' },
            { id: 'January 2025', name: 'January 2025' },
            { id: 'February 2025', name: 'February 2025' },
            { id: 'March 2025', name: 'March 2025' },
            { id: 'April 2025', name: 'April 2025' },
            { id: 'May 2025', name: 'May 2025' },
            { id: 'June 2025', name: 'June 2025' }
          ]}
          validate={required()}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput 
          source="dueDate" 
          label="Due Date" 
          placeholder="Select due date"
          validate={required()}
        />
        <NumberInput 
          source="amount" 
          label="Amount (₹)" 
          placeholder="e.g. 5000.00"
          validate={required()}
        />
      </div>
      
      <SelectInput 
        source="status" 
        label="Status" 
        placeholder="Select invoice status"
        choices={[
          { id: 'pending', name: 'Pending' },
          { id: 'paid', name: 'Paid' },
          { id: 'overdue', name: 'Overdue' },
          { id: 'cancelled', name: 'Cancelled' }
        ]}
        validate={required()}
      />

      <Labeled label="Payment History" className="col-span-full">
        <ArrayField source="payments">
          <Datagrid bulkActionButtons={false} className="overflow-x-auto">
            <TextField source="amount" label="Amount (₹)" />
            <FunctionField
              label="Date"
              render={(record: any) => {
                if (!record.paidAt) return '-';
                return new Date(record.paidAt).toLocaleDateString('en-IN');
              }}
            />
            <TextField source="method" label="Payment Method" />
            <TextField source="transactionId" label="Transaction ID" className="hidden sm:table-cell" />
            <FunctionField
              label="Status"
              render={(record: any) => (
                <span className={
                  record.status === 'completed' ? 'text-green-600 font-medium' : 
                  record.status === 'failed' ? 'text-red-600 font-medium' : 
                  'text-yellow-600 font-medium'
                }>
                  {record.status || '-'}
                </span>
              )}
            />
          </Datagrid>
        </ArrayField>
      </Labeled>
    </SimpleForm>
  </Edit>
);

export default InvoicesEdit;