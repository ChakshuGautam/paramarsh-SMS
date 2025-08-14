import {
  Show,
  SimpleShowLayout,
  TextField,
} from '@/components/admin';

export const FeeSchedulesShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="name" />
        <TextField source="frequency" />
        <TextField source="dueDate" />
        <TextField source="amount" />
        <TextField source="feeStructureId" />
        <TextField source="createdAt" />
        <TextField source="updatedAt" />
      </SimpleShowLayout>
    </Show>
  );
};