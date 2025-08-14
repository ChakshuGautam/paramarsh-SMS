import {
  Edit,
  SimpleForm,
  TextInput,
} from '@/components/admin';

export const PreferencesEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="ownerType" required />
        <TextInput source="ownerId" required />
        <TextInput source="channel" required />
        <TextInput source="consent" />
        <TextInput source="quietHours" />
      </SimpleForm>
    </Edit>
  );
};