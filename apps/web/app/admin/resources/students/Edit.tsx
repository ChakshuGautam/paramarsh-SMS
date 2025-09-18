"use client";

import { 
  Edit, 
  SimpleForm, 
  TextInput, 
  SelectInput,
  DateInput,
  ReferenceInput,
  AutocompleteInput,
  DependentSectionInput,
  required
} from "@/components/admin";
import { 
  ArrayField,
  Datagrid,
  TextField,
  FunctionField,
  Labeled,
  EditButton,
  ShowButton
} from "react-admin";
import { Link } from "react-router-dom";
import { STUDENT_STATUS, GENDER } from "@/lib/constants";

export const StudentsEdit = () => (
  <Edit>
    <SimpleForm className="max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput 
          source="admissionNo" 
          label="Admission No" 
          placeholder="e.g. ADM2024001"
          validate={required()}
        />
        <TextInput 
          source="rollNumber" 
          label="Roll Number" 
          placeholder="e.g. 101 or A-15"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput 
          source="firstName" 
          label="First Name" 
          placeholder="e.g. Rajesh"
          validate={required()}
        />
        <TextInput 
          source="lastName" 
          label="Last Name" 
          placeholder="e.g. Kumar"
          validate={required()}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput 
          source="dob" 
          label="Date of Birth" 
          placeholder="Select date"
        />
        <SelectInput 
          source="gender" 
          label="Gender" 
          placeholder="Select gender"
          choices={[
            { id: GENDER.MALE, name: 'Male' },
            { id: GENDER.FEMALE, name: 'Female' },
            { id: GENDER.OTHER, name: 'Other' },
          ]}
          validate={required()}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReferenceInput reference="classes" source="classId" label="Class">
          <AutocompleteInput 
            optionText="name" 
            placeholder="Search for class (e.g. Class 10)"
            validate={required()}
          />
        </ReferenceInput>
        <DependentSectionInput 
          placeholder="Search for section (e.g. Section A)"
          validate={required()} 
        />
      </div>
      
      <SelectInput 
        source="status" 
        label="Status" 
        placeholder="Select student status"
        choices={[
          { id: STUDENT_STATUS.ACTIVE, name: 'Active' },
          { id: STUDENT_STATUS.INACTIVE, name: 'Inactive' },
          { id: STUDENT_STATUS.GRADUATED, name: 'Graduated' },
          { id: STUDENT_STATUS.TRANSFERRED, name: 'Transferred' },
          { id: STUDENT_STATUS.DROPPED, name: 'Dropped' },
        ]}
      />
      
      <Labeled label="Guardians" className="col-span-full">
        <ArrayField source="guardians">
          <Datagrid bulkActionButtons={false} className="overflow-x-auto" rowClick={false}>
            <FunctionField
              label="Name"
              render={(record: any) => {
                const guardian = record?.guardian;
                if (!guardian) return '-';
                return (
                  <Link 
                    to={`/guardians/${guardian.id || record.guardianId}/show`}
                    className="text-primary hover:underline"
                  >
                    {guardian.name || '-'}
                  </Link>
                );
              }}
            />
            <TextField source="relation" label="Relation" />
            <FunctionField
              label="Contact"
              render={(record: any) => {
                const guardian = record?.guardian;
                if (!guardian) return '-';
                return guardian.phoneNumber || guardian.phone || '-';
              }}
            />
            <FunctionField
              label="Email"
              className="hidden sm:table-cell"
              render={(record: any) => {
                const guardian = record?.guardian;
                if (!guardian) return '-';
                return guardian.email || '-';
              }}
            />
            <FunctionField
              label="Primary"
              render={(record: any) => (
                <span className={record.isPrimary ? 'text-green-600 font-medium' : 'text-gray-400'}>
                  {record.isPrimary ? 'Yes' : 'No'}
                </span>
              )}
            />
            <FunctionField
              label="Actions"
              render={(record: any) => {
                const guardian = record?.guardian;
                if (!guardian) return null;
                const guardianId = guardian.id || record.guardianId;
                if (!guardianId) return null;
                return (
                  <div className="flex gap-2">
                    <Link 
                      to={`/guardians/${guardianId}/show`}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
                    >
                      View
                    </Link>
                    <Link 
                      to={`/guardians/${guardianId}`}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3"
                    >
                      Edit
                    </Link>
                  </div>
                );
              }}
            />
          </Datagrid>
        </ArrayField>
      </Labeled>
    </SimpleForm>
  </Edit>
);

export default StudentsEdit;
