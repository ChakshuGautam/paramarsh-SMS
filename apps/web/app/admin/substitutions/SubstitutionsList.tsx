import {
  List,
  DataTable,
  TextField,
<<<<<<< HEAD
  ReferenceField,
  StatusBadge,
} from '@/components/admin';
import { useRecordContext } from 'ra-core';

const PeriodField = () => {
  const record = useRecordContext();
  if (!record?.periodId) return <span>-</span>;
  // Display period number and day instead of trying to show a name
  return <span>Period {record.periodNumber || '-'}</span>;
};

const TeacherNameField = () => {
  const record = useRecordContext();
  if (!record) return null;
  // Combine firstName and lastName for teachers linked to staff
  return <span>{record.firstName} {record.lastName}</span>;
};

const ApprovedByField = () => {
  const record = useRecordContext();
  if (!record) return null;
  // Combine firstName and lastName for staff
  return <span>{record.firstName} {record.lastName}</span>;
};
=======
} from '@/components/admin';
>>>>>>> origin/main

export const SubstitutionsList = () => {
  return (
    <List>
      <DataTable>
<<<<<<< HEAD
        <DataTable.Col source="periodId" label="Period">
          <PeriodField />
=======
        <DataTable.Col source="periodId" label="Period ID">
          <TextField source="periodId" />
>>>>>>> origin/main
        </DataTable.Col>
        <DataTable.Col source="date" label="Date">
          <TextField source="date" />
        </DataTable.Col>
<<<<<<< HEAD
        <DataTable.Col label="Substitute Teacher">
          <ReferenceField source="substituteTeacherId" reference="teachers" link={false}>
            <ReferenceField source="staffId" reference="staff" link={false}>
              <TeacherNameField />
            </ReferenceField>
          </ReferenceField>
        </DataTable.Col>
        <DataTable.Col label="Substitute Room">
          <ReferenceField source="substituteRoomId" reference="rooms" link={false}>
            <TextField source="name" />
          </ReferenceField>
=======
        <DataTable.Col source="substituteTeacherId" label="Substitute Teacher">
          <TextField source="substituteTeacherId" />
        </DataTable.Col>
        <DataTable.Col source="substituteRoomId" label="Substitute Room">
          <TextField source="substituteRoomId" />
>>>>>>> origin/main
        </DataTable.Col>
        <DataTable.Col source="reason" label="Reason">
          <TextField source="reason" />
        </DataTable.Col>
        <DataTable.Col source="status" label="Status">
<<<<<<< HEAD
          <StatusBadge />
        </DataTable.Col>
        <DataTable.Col label="Approved By">
          <ReferenceField source="approvedBy" reference="staff" link={false}>
            <ApprovedByField />
          </ReferenceField>
=======
          <TextField source="status" />
        </DataTable.Col>
        <DataTable.Col source="approvedBy" label="Approved By">
          <TextField source="approvedBy" />
>>>>>>> origin/main
        </DataTable.Col>
      </DataTable>
    </List>
  );
};