"use client";

import { 
  Edit, 
  SimpleForm, 
  ReferenceInput,
  AutocompleteInput,
  SelectInput,
  DateInput,
  TextInput,
  required 
} from "@/components/admin";
import { 
  TextField,
  FunctionField,
  Labeled
} from "react-admin";

export const EnrollmentsEdit = () => (
  <Edit>
    <SimpleForm className="max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReferenceInput source="studentId" reference="students" disabled>
          <AutocompleteInput 
            optionText={(choice) => `${choice.firstName} ${choice.lastName} (${choice.admissionNo})`} 
            label="Student (Cannot be changed)"
            placeholder="Student details locked for this enrollment"
          />
        </ReferenceInput>
        <ReferenceInput source="sectionId" reference="sections" validate={required()}>
          <AutocompleteInput 
            optionText={(record) => {
              if (!record.class) return record.name || 'Unknown Section';
              return `${record.class.name} - ${record.name}`;
            }}
            placeholder="Search for section (e.g. Class 10 - Section A)"
            label="Section"
          />
        </ReferenceInput>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput 
          source="startDate" 
          label="Enrollment Start Date" 
          placeholder="Select start date"
          validate={required()} 
        />
        <DateInput 
          source="endDate" 
          label="Enrollment End Date" 
          placeholder="Select end date (optional)"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectInput 
          source="status" 
          label="Enrollment Status" 
          placeholder="Select enrollment status"
          choices={[
            { id: 'enrolled', name: 'Enrolled' },
            { id: 'active', name: 'Active' },
            { id: 'inactive', name: 'Inactive' },
            { id: 'graduated', name: 'Graduated' },
            { id: 'transferred', name: 'Transferred' },
            { id: 'dropped', name: 'Dropped' },
            { id: 'suspended', name: 'Suspended' },
            { id: 'completed', name: 'Completed' },
          ]}
          validate={required()}
        />
        <ReferenceInput source="academicYearId" reference="academicYears" label="Academic Year">
          <AutocompleteInput 
            optionText="name"
            placeholder="Search for academic year (e.g. 2024-25)"
          />
        </ReferenceInput>
      </div>

      <TextInput 
        source="notes" 
        label="Notes" 
        placeholder="e.g. Mid-year transfer from another section"
        multiline 
        className="col-span-full"
      />

      <Labeled label="Student Information" className="col-span-full">
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Name</div>
              <FunctionField
                render={(record: any) => {
                  if (!record.student) return '-';
                  return `${record.student.firstName} ${record.student.lastName}`;
                }}
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Admission No</div>
              <TextField source="student.admissionNo" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Roll Number</div>
              <TextField source="student.rollNumber" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
              <FunctionField
                render={(record: any) => (
                  <span className={
                    record.student?.status === 'active' ? 'text-green-600 font-medium' : 
                    record.student?.status === 'inactive' ? 'text-gray-400' :
                    record.student?.status === 'graduated' ? 'text-blue-600 font-medium' :
                    'text-yellow-600 font-medium'
                  }>
                    {record.student?.status || 'Unknown'}
                  </span>
                )}
              />
            </div>
          </div>
        </div>
      </Labeled>

      <Labeled label="Section Information" className="col-span-full">
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Class & Section</div>
              <FunctionField
                render={(record: any) => {
                  if (!record.section) return '-';
                  if (!record.section.class) return record.section.name || '-';
                  return `${record.section.class.name} - ${record.section.name}`;
                }}
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Capacity</div>
              <TextField source="section.capacity" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Class Teacher ID</div>
              <TextField source="section.homeroomTeacherId" />
            </div>
          </div>
        </div>
      </Labeled>
    </SimpleForm>
  </Edit>
);

export default EnrollmentsEdit;