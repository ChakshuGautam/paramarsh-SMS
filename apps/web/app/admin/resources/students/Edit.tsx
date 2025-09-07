"use client";

import { 
  Edit, 
  SimpleForm, 
  TextInput, 
  SelectInput,
  DateInput,
  required
} from "@/components/admin";
import { ReferenceInput } from "@/components/admin/reference-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { STUDENT_STATUS, GENDER } from "@/lib/constants";

export const StudentsEdit = () => (
  <Edit>
    <SimpleForm>
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
      <ReferenceInput reference="classes" source="classId" label="Class">
        <AutocompleteInput 
          optionText="name" 
          placeholder="Search for class (e.g. Class 10)"
          validate={required()}
        />
      </ReferenceInput>
      <ReferenceInput reference="sections" source="sectionId" label="Section">
        <AutocompleteInput 
          optionText="name" 
          placeholder="Search for section (e.g. Section A)"
          validate={required()}
        />
      </ReferenceInput>
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
    </SimpleForm>
  </Edit>
);

export default StudentsEdit;
