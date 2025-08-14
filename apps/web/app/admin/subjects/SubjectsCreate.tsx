import {
  Create,
  SimpleForm,
  TextInput,
} from '@/components/admin';

export const SubjectsCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="code" required />
        <TextInput source="name" required />
        <TextInput source="description" />
        <TextInput source="credits" />
        <TextInput source="isElective" />
        <TextInput source="prerequisites" />
      </SimpleForm>
    </Create>
  );
};