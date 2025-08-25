"use client";

import { 
  BaseCreateForm, 
  FormSection,
  TextInput, 
  SelectInput,
  DateInput,
  required,
  email
} from "@/components/admin";
import { GENDER, EXPERIENCE_LEVEL } from "@/lib/constants";
import { parseFlexibleArray } from "@/lib/utils/parse-utils";

export const TeachersCreate = () => (
  <BaseCreateForm>
    <FormSection title="Personal Information">
      <TextInput source="firstName" label="First Name" validate={required()} />
      <TextInput source="lastName" label="Last Name" validate={required()} />
      <TextInput source="email" label="Email" validate={email()} />
      <TextInput source="phone" label="Phone" validate={required()} />
      <DateInput source="dob" label="Date of Birth" />
      <SelectInput 
        source="gender" 
        label="Gender" 
        choices={[
          { id: GENDER.MALE, name: 'Male' },
          { id: GENDER.FEMALE, name: 'Female' },
          { id: GENDER.OTHER, name: 'Other' },
        ]}
      />
    </FormSection>

    <FormSection title="Professional Information">
      <TextInput source="employeeId" label="Employee ID" validate={required()} />
      <TextInput source="subjects" label="Subjects (comma-separated)" />
      <TextInput source="qualifications" label="Qualifications (comma-separated)" />
      <SelectInput 
        source="experience" 
        label="Experience Level" 
        choices={[
          { id: EXPERIENCE_LEVEL.FRESHER, name: 'Fresher (0-2 years)' },
          { id: EXPERIENCE_LEVEL.MID, name: 'Mid-level (3-5 years)' },
          { id: EXPERIENCE_LEVEL.SENIOR, name: 'Senior (5-10 years)' },
          { id: EXPERIENCE_LEVEL.EXPERT, name: 'Expert (10+ years)' },
        ]}
      />
      <DateInput source="joiningDate" label="Joining Date" />
    </FormSection>

    <FormSection title="Contact Information">
      <TextInput source="address" label="Address" multiline />
      <TextInput source="city" label="City" />
      <TextInput source="state" label="State" />
      <TextInput source="pincode" label="PIN Code" />
    </FormSection>
  </BaseCreateForm>
);

export default TeachersCreate;
