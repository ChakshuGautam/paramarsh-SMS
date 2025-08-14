import {
  Create,
  SimpleForm,
  TextInput,
} from '@/components/admin';

export const TenantsCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" required />
        <TextInput source="domain" required />
        <TextInput source="status" />
        <TextInput source="plan" />
        <TextInput source="config" />
      </SimpleForm>
    </Create>
  );
};