import {
  Create,
  SimpleForm,
  TextInput,
} from '@/components/admin';

export const RoomsCreate = () => {
  return (
    <Create>
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
    </Create>
  );
};