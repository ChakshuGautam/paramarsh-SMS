import {
  List,
  DataTable,
  TextField,
  ReferenceField,
  StatusBadge,
} from '@/components/admin';
import { useRecordContext } from 'ra-core';
import { DateField } from 'react-admin';

const PeriodField = () => {
  const record = useRecordContext();
  if (!record?.period) return <span>-</span>;
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const day = dayNames[record.period.dayOfWeek] || '';
  return <span>{day} - Period {record.period.periodNumber || '-'}</span>;
};

const SubstituteTeacherField = () => {
  const record = useRecordContext();
  if (!record?.substituteTeacher?.staff) return <span>-</span>;
  const staff = record.substituteTeacher.staff;
  return <span>{staff.firstName} {staff.lastName}</span>;
};

const SubstituteRoomField = () => {
  const record = useRecordContext();
  if (!record?.substituteRoom) return <span>-</span>;
  return <span>{record.substituteRoom.name}</span>;
};

const ApprovedByField = () => {
  const record = useRecordContext();
  if (!record?.approvedBy) return <span>-</span>;
  // For now just show the ID, since we don't have the full staff data
  return <span>{record.approvedBy}</span>;
};

export const SubstitutionsList = () => {
  return (
    <List>
      <DataTable>
        <DataTable.Col source="period" label="Period">
          <PeriodField />
        </DataTable.Col>
        <DataTable.Col source="date" label="Date">
          <DateField source="date" />
        </DataTable.Col>
        <DataTable.Col label="Substitute Teacher">
          <SubstituteTeacherField />
        </DataTable.Col>
        <DataTable.Col label="Substitute Room">
          <SubstituteRoomField />
        </DataTable.Col>
        <DataTable.Col source="reason" label="Reason">
          <TextField source="reason" />
        </DataTable.Col>
        <DataTable.Col source="status" label="Status">
          <StatusBadge />
        </DataTable.Col>
        <DataTable.Col label="Approved By">
          <ApprovedByField />
        </DataTable.Col>
      </DataTable>
    </List>
  );
};