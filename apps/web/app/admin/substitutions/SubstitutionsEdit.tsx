import {
  Edit,
  SimpleForm,
  TextInput,
} from '@/components/admin';

export const SubstitutionsEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="periodId" required />
        <TextInput source="date" required />
        <TextInput source="substituteTeacherId" />
        <TextInput source="substituteRoomId" />
        <TextInput source="reason" />
        <TextInput source="status" />
        <TextInput source="approvedBy" />
      </SimpleForm>
    </Edit>
  );
};