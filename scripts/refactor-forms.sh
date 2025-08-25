#!/bin/bash

echo "🔄 Refactoring Create and Edit components to use BaseForm..."

# Update Teachers Create
cat > apps/web/app/admin/resources/teachers/Create.tsx << 'EOF'
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
EOF

# Update Guardians Create
cat > apps/web/app/admin/resources/guardians/Create.tsx << 'EOF'
"use client";

import { 
  BaseCreateForm, 
  FormSection,
  TextInput, 
  SelectInput,
  required,
  email
} from "@/components/admin";
import { GUARDIAN_RELATION } from "@/lib/constants";

export const GuardiansCreate = () => (
  <BaseCreateForm>
    <FormSection title="Guardian Information">
      <TextInput source="name" label="Full Name" validate={required()} />
      <SelectInput 
        source="relation" 
        label="Relation" 
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
      <TextInput source="occupation" label="Occupation" />
    </FormSection>

    <FormSection title="Contact Information">
      <TextInput source="phone" label="Phone" validate={required()} />
      <TextInput source="email" label="Email" validate={email()} />
      <TextInput source="address" label="Address" multiline />
    </FormSection>
  </BaseCreateForm>
);

export default GuardiansCreate;
EOF

# Update Staff Create
cat > apps/web/app/admin/resources/staff/Create.tsx << 'EOF'
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
import { GENDER, STAFF_DESIGNATION, EMPLOYEE_TYPE, STAFF_STATUS } from "@/lib/constants";

export const StaffCreate = () => (
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

    <FormSection title="Employment Details">
      <TextInput source="employeeId" label="Employee ID" validate={required()} />
      <SelectInput 
        source="designation" 
        label="Designation" 
        choices={[
          { id: STAFF_DESIGNATION.PRINCIPAL, name: 'Principal' },
          { id: STAFF_DESIGNATION.VICE_PRINCIPAL, name: 'Vice Principal' },
          { id: STAFF_DESIGNATION.ADMIN, name: 'Admin' },
          { id: STAFF_DESIGNATION.ACCOUNTANT, name: 'Accountant' },
          { id: STAFF_DESIGNATION.CLERK, name: 'Clerk' },
          { id: STAFF_DESIGNATION.LIBRARIAN, name: 'Librarian' },
          { id: STAFF_DESIGNATION.LAB_ASSISTANT, name: 'Lab Assistant' },
          { id: STAFF_DESIGNATION.SECURITY, name: 'Security' },
          { id: STAFF_DESIGNATION.JANITOR, name: 'Janitor' },
          { id: STAFF_DESIGNATION.OTHER, name: 'Other' },
        ]}
        validate={required()}
      />
      <SelectInput 
        source="employeeType" 
        label="Employee Type" 
        choices={[
          { id: EMPLOYEE_TYPE.NON_TEACHING, name: 'Non-Teaching' },
          { id: EMPLOYEE_TYPE.SUPPORT, name: 'Support Staff' },
          { id: EMPLOYEE_TYPE.ADMIN, name: 'Administrative' },
        ]}
      />
      <DateInput source="joiningDate" label="Joining Date" />
      <SelectInput 
        source="status" 
        label="Status" 
        choices={[
          { id: STAFF_STATUS.ACTIVE, name: 'Active' },
          { id: STAFF_STATUS.INACTIVE, name: 'Inactive' },
          { id: STAFF_STATUS.ON_LEAVE, name: 'On Leave' },
        ]}
        defaultValue={STAFF_STATUS.ACTIVE}
      />
    </FormSection>

    <FormSection title="Address">
      <TextInput source="address" label="Address" multiline />
      <TextInput source="city" label="City" />
      <TextInput source="state" label="State" />
      <TextInput source="pincode" label="PIN Code" />
    </FormSection>
  </BaseCreateForm>
);

export default StaffCreate;
EOF

echo "✅ Create components refactored to use BaseCreateForm!"