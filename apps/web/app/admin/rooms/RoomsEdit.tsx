import {
  Edit,
  SimpleForm,
  TextInput,
} from '@/components/admin';

export const RoomsEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="code" required />
        <TextInput source="name" required />
        <TextInput source="building" />
        <TextInput source="floor" />
        <TextInput source="capacity" required />
        <TextInput source="type" required />
        <TextInput source="facilities" />
        <TextInput source="isActive" />
      </SimpleForm>
    </Edit>
  );
};