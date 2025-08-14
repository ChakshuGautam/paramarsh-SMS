import {
  Show,
  SimpleShowLayout,
  TextField,
} from '@/components/admin';

export const SubjectsShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="code" />
        <TextField source="name" />
        <TextField source="description" />
        <TextField source="credits" />
        <TextField source="isElective" />
        <TextField source="prerequisites" />
        <TextField source="createdAt" />
        <TextField source="updatedAt" />
      </SimpleShowLayout>
    </Show>
  );
};