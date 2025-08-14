import {
  Edit,
  SimpleForm,
  TextInput,
} from '@/components/admin';

export const TenantsEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" required />
        <TextInput source="domain" required />
        <TextInput source="status" />
        <TextInput source="plan" />
        <TextInput source="config" />
      </SimpleForm>
    </Edit>
  );
};