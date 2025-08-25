"use client";

<<<<<<< HEAD
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
=======
import { Create, SimpleForm, TextInput } from "@/components/admin";
import { ReferenceInput } from "@/components/admin/reference-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";

export const GuardiansCreate = () => (
  <Create>
    <SimpleForm>
      <ReferenceInput reference="students" source="studentId" label="Student">
        <AutocompleteInput optionText="firstName" />
      </ReferenceInput>
      <TextInput source="relation" label="Relation" />
      <TextInput source="name" label="Name" />
      <TextInput source="phone" label="Phone" />
      <TextInput source="email" label="Email" />
      <TextInput source="address" label="Address" />
    </SimpleForm>
  </Create>
>>>>>>> origin/main
);

export default GuardiansCreate;
