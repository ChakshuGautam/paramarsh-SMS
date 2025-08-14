import {
  Show,
  SimpleShowLayout,
  TextField,
} from '@/components/admin';

export const PreferencesShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="ownerType" />
        <TextField source="ownerId" />
        <TextField source="channel" />
        <TextField source="consent" />
        <TextField source="quietHours" />
        <TextField source="createdAt" />
        <TextField source="updatedAt" />
      </SimpleShowLayout>
    </Show>
  );
};