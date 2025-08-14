import {
  List,
  DataTable,
  TextField,
  SearchInput,
  SelectInput,
  NumberInput,
  BooleanInput,
} from '@/components/admin';

const subjectFilters = [
  <SearchInput source="q" placeholder="Search subjects..." alwaysOn />,
  <NumberInput source="credits" label="Credits" />,
  <BooleanInput source="isActive" label="Active" />,
  <BooleanInput source="isElective" label="Elective" />,
];

export const SubjectsList = () => {
  return (
    <List filters={subjectFilters}>
      <DataTable>
        <TextField source="code" />
        <TextField source="name" />
        <TextField source="description" />
        <TextField source="credits" />
        <TextField source="isElective" />
        <TextField source="createdAt" />
      </DataTable>
    </List>
  );
};