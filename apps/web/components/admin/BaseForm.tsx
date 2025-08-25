"use client";

import React from 'react';
import { Create, Edit, SimpleForm } from 'react-admin';
import type { ReactElement } from 'react';

export interface BaseFormProps {
  children: React.ReactNode;
  defaultValues?: Record<string, any>;
  validate?: (values: Record<string, any>) => Record<string, any>;
  transform?: (data: Record<string, any>) => Record<string, any>;
  redirect?: 'list' | 'show' | 'edit' | false;
  className?: string;
}

/**
 * BaseCreateForm - Eliminates boilerplate for Create forms
 * Wraps Create and SimpleForm components with standard configuration
 */
export const BaseCreateForm: React.FC<BaseFormProps> = ({
  children,
  defaultValues,
  validate,
  transform,
  redirect = 'list',
  className,
}) => {
  return (
    <Create redirect={redirect}>
      <SimpleForm 
        defaultValues={defaultValues}
        validate={validate}
        transform={transform}
        className={className}
      >
        {children}
      </SimpleForm>
    </Create>
  );
};

/**
 * BaseEditForm - Eliminates boilerplate for Edit forms
 * Wraps Edit and SimpleForm components with standard configuration
 */
export const BaseEditForm: React.FC<BaseFormProps> = ({
  children,
  defaultValues,
  validate,
  transform,
  redirect = 'list',
  className,
}) => {
  return (
    <Edit redirect={redirect}>
      <SimpleForm 
        defaultValues={defaultValues}
        validate={validate}
        transform={transform}
        className={className}
      >
        {children}
      </SimpleForm>
    </Edit>
  );
};

/**
 * FormSection - Groups related form fields with optional title
 */
export interface FormSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  children, 
  className = '' 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">
          {title}
        </h3>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
};

/**
 * Common form field configurations for reuse
 */
export const CommonFields = {
  // Personal Information Fields
  firstName: () => (
    <TextInput source="firstName" label="First Name" validate={required()} />
  ),
  lastName: () => (
    <TextInput source="lastName" label="Last Name" validate={required()} />
  ),
  name: () => (
    <TextInput source="name" label="Name" validate={required()} />
  ),
  email: () => (
    <TextInput source="email" label="Email" validate={email()} />
  ),
  phone: () => (
    <TextInput source="phone" label="Phone" validate={phoneValidator} />
  ),
  dob: () => (
    <DateInput source="dob" label="Date of Birth" />
  ),
  gender: () => (
    <SelectInput 
      source="gender" 
      label="Gender" 
      choices={[
        { id: 'male', name: 'Male' },
        { id: 'female', name: 'Female' },
        { id: 'other', name: 'Other' },
      ]} 
    />
  ),
  
  // Address Fields
  address: () => (
    <TextInput source="address" label="Address" multiline />
  ),
  city: () => (
    <TextInput source="city" label="City" />
  ),
  state: () => (
    <TextInput source="state" label="State" />
  ),
  pincode: () => (
    <TextInput source="pincode" label="PIN Code" />
  ),
  
  // Status Fields
  status: (choices: Array<{ id: string; name: string }>) => (
    <SelectInput 
      source="status" 
      label="Status" 
      choices={choices}
      validate={required()}
    />
  ),
  
  // Reference Fields
  classReference: () => (
    <ReferenceInput source="classId" reference="classes">
      <AutocompleteInput 
        label="Class" 
        optionText="name" 
        validate={required()} 
      />
    </ReferenceInput>
  ),
  sectionReference: () => (
    <ReferenceInput source="sectionId" reference="sections">
      <AutocompleteInput 
        label="Section" 
        optionText="name" 
        validate={required()} 
      />
    </ReferenceInput>
  ),
  studentReference: () => (
    <ReferenceInput source="studentId" reference="students">
      <AutocompleteInput 
        label="Student" 
        optionText={(record: any) => `${record.firstName} ${record.lastName}`}
        validate={required()} 
      />
    </ReferenceInput>
  ),
};

// Import required components for CommonFields
import { 
  TextInput, 
  DateInput, 
  SelectInput, 
  ReferenceInput, 
  AutocompleteInput,
  required,
  email,
} from 'react-admin';

// Custom validators
const phoneValidator = (value: string) => {
  if (!value) return undefined;
  const phoneRegex = /^[6-9]\d{9}$/; // Indian phone number format
  if (!phoneRegex.test(value.replace(/[\s-]/g, ''))) {
    return 'Please enter a valid phone number';
  }
  return undefined;
};

/**
 * Higher-order component to create resource-specific forms
 * Reduces boilerplate across all Create/Edit components
 */
export function createResourceForm<T = any>(
  formType: 'create' | 'edit',
  fields: ReactElement | ((props?: T) => ReactElement),
  options?: {
    defaultValues?: Record<string, any>;
    validate?: (values: Record<string, any>) => Record<string, any>;
    transform?: (data: Record<string, any>) => Record<string, any>;
    redirect?: 'list' | 'show' | 'edit' | false;
  }
) {
  const FormComponent = formType === 'create' ? BaseCreateForm : BaseEditForm;
  
  return (props?: T) => {
    const formFields = typeof fields === 'function' ? fields(props) : fields;
    
    return (
      <FormComponent {...options}>
        {formFields}
      </FormComponent>
    );
  };
}