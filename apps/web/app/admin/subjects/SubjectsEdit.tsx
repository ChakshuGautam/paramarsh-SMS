import {
  Edit,
  SimpleForm,
  TextInput,
} from '@/components/admin';

export const SubjectsEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="code" required />
        <TextInput source="name" required />
        <TextInput source="description" />
        <TextInput source="credits" />
        <TextInput source="isElective" />
        <TextInput source="prerequisites" />
      </SimpleForm>
    </Edit>
  );
};