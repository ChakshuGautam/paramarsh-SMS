"use client";

import { Create, SimpleForm, TextInput, SelectInput } from "@/components/admin";
import { ReferenceInput } from "@/components/admin/reference-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";

export const InvoicesCreate = () => (
  <Create>
    <SimpleForm>
      <ReferenceInput reference="students" source="studentId" label="Student">
        <AutocompleteInput optionText="firstName" />
      </ReferenceInput>
      <SelectInput 
        source="period" 
        label="Period" 
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
      />
      <TextInput source="dueDate" label="Due" />
      <TextInput source="amount" label="Amount" />
      <TextInput source="status" label="Status" />
    </SimpleForm>
  </Create>
);

export default InvoicesCreate;





