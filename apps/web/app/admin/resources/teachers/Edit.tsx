"use client";

import { 
  Edit, 
  SimpleForm, 
  TextInput, 
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

export const TeachersEdit = () => (
  <Edit>
    <SimpleForm className="max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReferenceInput reference="staff" source="staffId" label="Staff Member">
          <AutocompleteInput 
            optionText={(record: any) => `${record.firstName} ${record.lastName} (${record.employeeId})`}
            placeholder="Search for staff member (e.g. Dr. Rajesh Kumar)"
            validate={required()}
          />
        </ReferenceInput>
        <NumberInput 
          source="experienceYears" 
          label="Experience (Years)" 
          placeholder="e.g. 5"
          validate={required()}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput 
          source="subjects" 
          label="Subjects" 
          placeholder="e.g. Mathematics, Physics, Chemistry"
          helperText="Comma-separated list of subjects"
          multiline
        />
        <TextInput 
          source="qualifications" 
          label="Qualifications" 
          placeholder="e.g. M.Sc. Mathematics, B.Ed."
          multiline
        />
      </div>

      <Labeled label="Teaching Assignments" className="col-span-full">
        <ArrayField source="assignments">
          <Datagrid bulkActionButtons={false} className="overflow-x-auto">
            <FunctionField
              label="Class & Section"
              render={(record: any) => {
                if (!record.section) return '-';
                return `${record.section.class?.name || 'N/A'} - ${record.section.name}`;
              }}
            />
            <FunctionField
              label="Subject"
              render={(record: any) => {
                if (!record.subject) return '-';
                return record.subject.name || '-';
              }}
            />
            <FunctionField
              label="Academic Year"
              render={(record: any) => {
                if (!record.academicYear) return '-';
                return record.academicYear.name || '-';
              }}
            />
            <FunctionField
              label="Status"
              render={(record: any) => (
                <span className={
                  record.isActive ? 'text-green-600 font-medium' : 'text-gray-400'
                }>
                  {record.isActive ? 'Active' : 'Inactive'}
                </span>
              )}
            />
            <TextField source="notes" label="Notes" className="hidden sm:table-cell" />
          </Datagrid>
        </ArrayField>
      </Labeled>
    </SimpleForm>
  </Edit>
);

export default TeachersEdit;