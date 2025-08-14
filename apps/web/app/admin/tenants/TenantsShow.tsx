import {
  Show,
  SimpleShowLayout,
  TextField,
} from '@/components/admin';

export const TenantsShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="name" />
        <TextField source="domain" />
        <TextField source="status" />
        <TextField source="plan" />
        <TextField source="config" />
        <TextField source="createdAt" />
        <TextField source="updatedAt" />
      </SimpleShowLayout>
    </Show>
  );
};