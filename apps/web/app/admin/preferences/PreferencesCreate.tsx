import {
  Create,
  SimpleForm,
  TextInput,
} from '@/components/admin';

export const PreferencesCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="ownerType" required />
        <TextInput source="ownerId" required />
        <TextInput source="channel" required />
        <TextInput source="consent" />
        <TextInput source="quietHours" />
      </SimpleForm>
    </Create>
  );
};