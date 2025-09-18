"use client";

import { 
  Edit, 
  SimpleForm, 
  TextInput,
  SelectInput,
  NumberInput,
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

export const AdmissionsApplicationsEdit = () => (
  <Edit>
    <SimpleForm className="max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput 
          source="applicationNumber" 
          label="Application Number" 
          placeholder="e.g. APP-2024-001"
          validate={required()}
        />
        <ReferenceInput reference="admissionPrograms" source="programId" label="Admission Program">
          <AutocompleteInput 
            optionText={(record) => `${record.name} (${record.academicYear})`}
            placeholder="Search for program (e.g. Class 1 Admission 2024-25)"
            validate={required()}
          />
        </ReferenceInput>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectInput 
          source="status" 
          label="Application Status"
          placeholder="Select application status"
          choices={[
            { id: 'submitted', name: 'Submitted' },
            { id: 'under_review', name: 'Under Review' },
            { id: 'documents_pending', name: 'Documents Pending' },
            { id: 'interview_scheduled', name: 'Interview Scheduled' },
            { id: 'accepted', name: 'Accepted' },
            { id: 'rejected', name: 'Rejected' },
            { id: 'waitlisted', name: 'Waitlisted' },
            { id: 'withdrawn', name: 'Withdrawn' }
          ]}
          validate={required()}
        />
        <NumberInput 
          source="score" 
          label="Assessment Score" 
          placeholder="e.g. 85.5"
          min={0}
          max={100}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput 
          source="submittedAt" 
          label="Submission Date" 
          placeholder="Select submission date"
        />
        <DateInput 
          source="interviewDate" 
          label="Interview Date" 
          placeholder="Select interview date (if applicable)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReferenceInput reference="branches" source="preferredBranchId" label="Preferred Branch">
          <AutocompleteInput 
            optionText="name"
            placeholder="Search for branch (e.g. DPS Main Campus)"
          />
        </ReferenceInput>
        <ReferenceInput reference="classes" source="appliedClassId" label="Applied For Class">
          <AutocompleteInput 
            optionText="name"
            placeholder="Search for class (e.g. Class 1, Pre-KG)"
          />
        </ReferenceInput>
      </div>

      <TextInput 
        source="remarks" 
        label="Remarks" 
        placeholder="e.g. Good academic performance, needs improvement in spoken English"
        multiline 
        className="col-span-full"
      />

      <Labeled label="Applicant Information" className="col-span-full">
        <ArrayField source="applicant">
          <Datagrid bulkActionButtons={false} className="overflow-x-auto">
            <TextField source="firstName" label="First Name" />
            <TextField source="lastName" label="Last Name" />
            <FunctionField
              label="Date of Birth"
              render={(record: any) => {
                if (!record.dob) return '-';
                return new Date(record.dob).toLocaleDateString('en-IN');
              }}
            />
            <TextField source="gender" label="Gender" />
            <TextField source="previousSchool" label="Previous School" className="hidden sm:table-cell" />
            <FunctionField
              label="Age"
              render={(record: any) => {
                if (!record.dob) return '-';
                const today = new Date();
                const birthDate = new Date(record.dob);
                const age = today.getFullYear() - birthDate.getFullYear();
                return `${age} years`;
              }}
            />
          </Datagrid>
        </ArrayField>
      </Labeled>

      <Labeled label="Guardian Information" className="col-span-full">
        <ArrayField source="applicant.guardians">
          <Datagrid bulkActionButtons={false} className="overflow-x-auto">
            <TextField source="name" label="Guardian Name" />
            <TextField source="relation" label="Relation" />
            <TextField source="phoneNumber" label="Phone" />
            <TextField source="email" label="Email" className="hidden sm:table-cell" />
            <TextField source="occupation" label="Occupation" className="hidden sm:table-cell" />
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

      <Labeled label="Documents Submitted" className="col-span-full">
        <ArrayField source="documents">
          <Datagrid bulkActionButtons={false} className="overflow-x-auto">
            <TextField source="documentType" label="Document Type" />
            <TextField source="fileName" label="File Name" />
            <FunctionField
              label="Uploaded Date"
              render={(record: any) => {
                if (!record.uploadedAt) return '-';
                return new Date(record.uploadedAt).toLocaleDateString('en-IN');
              }}
            />
            <FunctionField
              label="Status"
              render={(record: any) => (
                <span className={
                  record.status === 'verified' ? 'text-green-600 font-medium' : 
                  record.status === 'rejected' ? 'text-red-600 font-medium' : 
                  'text-yellow-600 font-medium'
                }>
                  {record.status || 'Pending'}
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

export default AdmissionsApplicationsEdit;