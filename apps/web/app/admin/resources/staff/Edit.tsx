"use client";

import { 
  Edit, 
  SimpleForm, 
  TextInput,
  SelectInput,
  DateInput,
  ReferenceInput,
  AutocompleteInput,
  required,
  email
} from "@/components/admin";
import { 
  ArrayField,
  Datagrid,
  TextField,
  FunctionField,
  Labeled
} from "react-admin";

export const StaffEdit = () => (
  <Edit>
    <SimpleForm className="max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput 
          source="employeeId" 
          label="Employee ID" 
          placeholder="e.g. EMP001"
          validate={required()}
        />
        <TextInput 
          source="firstName" 
          label="First Name" 
          placeholder="e.g. Rajesh"
          validate={required()}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput 
          source="lastName" 
          label="Last Name" 
          placeholder="e.g. Kumar"
          validate={required()}
        />
        <TextInput 
          source="email" 
          label="Email Address" 
          placeholder="e.g. rajesh.kumar@school.edu.in"
          validate={[required(), email()]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput 
          source="phone" 
          label="Phone Number" 
          placeholder="e.g. +91-9876543210"
          validate={required()}
        />
        <TextInput 
          source="alternatePhone" 
          label="Alternate Phone" 
          placeholder="e.g. +91-9876543211"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput 
          source="designation" 
          label="Designation" 
          placeholder="e.g. Senior Teacher, Principal, Administrator"
          validate={required()}
        />
        <ReferenceInput reference="branches" source="branchId" label="Branch">
          <AutocompleteInput 
            optionText="name"
            placeholder="Search for branch (e.g. DPS Main Campus)"
            validate={required()}
          />
        </ReferenceInput>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput 
          source="department" 
          label="Department" 
          placeholder="e.g. Mathematics, Administration, Sports"
        />
        <SelectInput 
          source="employmentType" 
          label="Employment Type" 
          placeholder="Select employment type"
          choices={[
            { id: 'full_time', name: 'Full Time' },
            { id: 'part_time', name: 'Part Time' },
            { id: 'contract', name: 'Contract' },
            { id: 'temporary', name: 'Temporary' }
          ]}
          validate={required()}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput 
          source="joinDate" 
          label="Join Date" 
          placeholder="Select joining date"
          validate={required()}
        />
        <SelectInput 
          source="status" 
          label="Status" 
          placeholder="Select status"
          choices={[
            { id: 'active', name: 'Active' },
            { id: 'inactive', name: 'Inactive' },
            { id: 'suspended', name: 'Suspended' },
            { id: 'terminated', name: 'Terminated' }
          ]}
          validate={required()}
        />
      </div>

      <TextInput 
        source="address" 
        label="Address" 
        placeholder="e.g. 123, ABC Colony, New Delhi - 110001"
        multiline 
        className="col-span-full"
      />

      <Labeled label="Teaching Assignments" className="col-span-full">
        <ArrayField source="teacherProfile">
          <Datagrid bulkActionButtons={false} className="overflow-x-auto">
            <FunctionField
              label="Subjects"
              render={(record: any) => {
                return record.subjects || '-';
              }}
            />
            <TextField source="qualifications" label="Qualifications" />
            <TextField source="experienceYears" label="Experience (Years)" />
            <FunctionField
              label="Assignments"
              className="hidden sm:table-cell"
              render={(record: any) => {
                if (!record.assignments || !Array.isArray(record.assignments)) return '0';
                return record.assignments.length;
              }}
            />
          </Datagrid>
        </ArrayField>
      </Labeled>
    </SimpleForm>
  </Edit>
);

export default StaffEdit;