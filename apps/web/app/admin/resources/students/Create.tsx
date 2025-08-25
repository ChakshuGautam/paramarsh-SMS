"use client";

<<<<<<< HEAD
import { 
  BaseCreateForm, 
  FormSection,
  TextInput, 
  SelectInput,
  DateInput,
  ReferenceInput,
  AutocompleteInput,
  required 
} from "@/components/admin";
import { STUDENT_STATUS, GENDER } from "@/lib/constants";

export const StudentsCreate = () => (
  <BaseCreateForm>
    <FormSection title="Personal Information">
      <TextInput source="admissionNo" label="Admission No" validate={required()} />
      <TextInput source="rollNumber" label="Roll Number" />
      <TextInput source="firstName" label="First Name" validate={required()} />
      <TextInput source="lastName" label="Last Name" validate={required()} />
      <DateInput source="dob" label="Date of Birth" />
      <SelectInput 
        source="gender" 
        label="Gender" 
        choices={[
          { id: GENDER.MALE, name: 'Male' },
          { id: GENDER.FEMALE, name: 'Female' },
          { id: GENDER.OTHER, name: 'Other' },
        ]}
        validate={required()}
      />
    </FormSection>

    <FormSection title="Academic Information">
      <ReferenceInput reference="classes" source="classId" label="Class">
        <AutocompleteInput optionText="name" validate={required()} />
      </ReferenceInput>
      <ReferenceInput reference="sections" source="sectionId" label="Section">
        <AutocompleteInput optionText="name" validate={required()} />
      </ReferenceInput>
      <SelectInput 
        source="status" 
        label="Status" 
        choices={[
          { id: STUDENT_STATUS.ACTIVE, name: 'Active' },
          { id: STUDENT_STATUS.INACTIVE, name: 'Inactive' },
          { id: STUDENT_STATUS.GRADUATED, name: 'Graduated' },
          { id: STUDENT_STATUS.TRANSFERRED, name: 'Transferred' },
          { id: STUDENT_STATUS.DROPPED, name: 'Dropped' },
        ]}
        defaultValue={STUDENT_STATUS.ACTIVE}
      />
    </FormSection>
  </BaseCreateForm>
);

export default StudentsCreate;
=======
import { Create, SimpleForm, TextInput } from "@/components/admin";
import { ReferenceInput } from "@/components/admin/reference-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";

export const StudentsCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="admissionNo" label="Admission No" />
      <TextInput source="firstName" label="First Name" />
      <TextInput source="lastName" label="Last Name" />
      <TextInput source="gender" label="Gender" />
      <ReferenceInput reference="classes" source="classId" label="Class">
        <AutocompleteInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput reference="sections" source="sectionId" label="Section">
        <AutocompleteInput optionText="name" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

export default StudentsCreate;
>>>>>>> origin/main
