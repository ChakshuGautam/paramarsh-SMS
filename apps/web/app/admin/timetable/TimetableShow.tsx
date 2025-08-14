import { Show, SimpleShowLayout, useRecordContext, TopToolbar, ListButton } from 'react-admin';
import { TimetableGrid } from '@/components/admin/TimetableGrid';

const TimetableContent = () => {
  const record = useRecordContext();
  
  if (!record) return null;
  
  return (
    <div className="w-full space-y-4">
      <h2 className="text-xl font-semibold">
        Timetable for {record.class?.name} - {record.name}
      </h2>
      
      <TimetableGrid 
        sectionId={record.id}
        sectionName={`${record.class?.name} - ${record.name}`}
        editable={true}
      />
    </div>
  );
};

const TimetableShowActions = () => (
  <TopToolbar>
    <ListButton />
  </TopToolbar>
);

export const TimetableShow = () => (
  <Show 
    resource="sectionTimetables"
    actions={<TimetableShowActions />}
    title="Section Timetable"
  >
    <SimpleShowLayout>
      <TimetableContent />
    </SimpleShowLayout>
  </Show>
);