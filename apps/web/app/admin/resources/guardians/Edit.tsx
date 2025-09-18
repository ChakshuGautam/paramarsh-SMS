"use client";

import { 
  Edit,
  SimpleForm,
  TextInput, 
  SelectInput,
  ReferenceInput,
  ReferenceArrayInput,
  AutocompleteInput,
  AutocompleteArrayInput,
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
import { GUARDIAN_RELATION } from "@/lib/constants";
import { useState } from "react";

export const GuardiansEdit = () => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Build filter for students based on selected class and section
  const studentFilter: any = {};
  if (selectedClass) studentFilter.classId = selectedClass;
  if (selectedSection) studentFilter.sectionId = selectedSection;

  return (
    <Edit>
      <SimpleForm className="max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput 
            source="name" 
            label="Full Name" 
            placeholder="e.g. Mr. Rajesh Kumar"
            validate={required()} 
          />
          <SelectInput 
            source="relation" 
            label="Default Relation" 
            placeholder="Select relation type"
            choices={[
              { id: GUARDIAN_RELATION.FATHER, name: 'Father' },
              { id: GUARDIAN_RELATION.MOTHER, name: 'Mother' },
              { id: GUARDIAN_RELATION.GUARDIAN, name: 'Guardian' },
              { id: GUARDIAN_RELATION.GRANDFATHER, name: 'Grandfather' },
              { id: GUARDIAN_RELATION.GRANDMOTHER, name: 'Grandmother' },
              { id: GUARDIAN_RELATION.UNCLE, name: 'Uncle' },
              { id: GUARDIAN_RELATION.AUNT, name: 'Aunt' },
              { id: GUARDIAN_RELATION.OTHER, name: 'Other' },
            ]}
            validate={required()}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput 
            source="phoneNumber" 
            label="Phone Number" 
            placeholder="e.g. +91-9876543210"
            validate={required()} 
          />
          <TextInput 
            source="alternatePhoneNumber" 
            label="Alternate Phone" 
            placeholder="e.g. +91-9876543211"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput 
            source="email" 
            label="Email Address" 
            placeholder="e.g. rajesh.kumar@example.com"
            validate={email()} 
          />
          <TextInput 
            source="occupation" 
            label="Occupation" 
            placeholder="e.g. Software Engineer"
          />
        </div>

        <TextInput 
          source="address" 
          label="Address" 
          placeholder="e.g. 123, ABC Colony, New Delhi"
          multiline 
          className="col-span-full"
        />

        <Labeled label="Linked Students" className="col-span-full">
          <ArrayField source="students">
            <Datagrid bulkActionButtons={false} className="overflow-x-auto">
              <FunctionField
                label="Student Name"
                render={(record: any) => {
                  const student = record?.student;
                  if (!student) return '-';
                  return `${student.firstName} ${student.lastName}` || '-';
                }}
              />
              <FunctionField
                label="Admission No"
                render={(record: any) => {
                  const student = record?.student;
                  if (!student) return '-';
                  return student.admissionNo || '-';
                }}
              />
              <FunctionField
                label="Class"
                className="hidden sm:table-cell"
                render={(record: any) => {
                  const student = record?.student;
                  if (!student || !student.class) return '-';
                  return student.class.name || '-';
                }}
              />
              <FunctionField
                label="Section"
                className="hidden sm:table-cell"
                render={(record: any) => {
                  const student = record?.student;
                  if (!student || !student.section) return '-';
                  return student.section.name || '-';
                }}
              />
              <TextField source="relation" label="Relation" />
              <FunctionField
                label="Primary Contact"
                render={(record: any) => (
                  <span className={record.isPrimary ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    {record.isPrimary ? 'Yes' : 'No'}
                  </span>
                )}
              />
            </Datagrid>
          </ArrayField>
        </Labeled>
      </SimpleForm>
    </Edit>
  );
};

export default GuardiansEdit;
