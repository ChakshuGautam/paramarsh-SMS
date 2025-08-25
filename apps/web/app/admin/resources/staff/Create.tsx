"use client";

<<<<<<< HEAD
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
=======
import { Create, SimpleForm, TextInput } from "@/components/admin";

export const StaffCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="firstName" label="First Name" />
      <TextInput source="lastName" label="Last Name" />
      <TextInput source="email" label="Email" />
      <TextInput source="phone" label="Phone" />
      <TextInput source="designation" label="Designation" />
      <TextInput source="department" label="Department" />
      <TextInput source="employmentType" label="Type" />
      <TextInput source="joinDate" label="Join Date" />
      <TextInput source="status" label="Status" />
    </SimpleForm>
  </Create>
>>>>>>> origin/main
);

export default StaffCreate;
