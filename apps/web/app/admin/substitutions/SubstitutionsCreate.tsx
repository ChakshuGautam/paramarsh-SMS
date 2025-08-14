import {
  Create,
  SimpleForm,
  TextInput,
} from '@/components/admin';

export const SubstitutionsCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="periodId" required />
        <TextInput source="date" required />
        <TextInput source="substituteTeacherId" />
        <TextInput source="substituteRoomId" />
        <TextInput source="reason" />
      </SimpleForm>
    </Create>
  );
};