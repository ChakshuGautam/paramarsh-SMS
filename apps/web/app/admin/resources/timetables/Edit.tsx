"use client";

import React from 'react';
import { Edit, SimpleForm, TextInput, NumberInput } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";
import { TextField } from "@/components/admin/text-field";
import { useRecordContext } from 'ra-core';
import TimetableCalendar from './components/TimetableCalendar';

// Component to display the timetable calendar within the form
const TimetableCalendarField = () => {
  const record = useRecordContext();
  
  if (!record) return null;
  
  return (
    <div className="mt-6">
      <TimetableCalendar
        sectionId={record.id}
        sectionInfo={{
          id: record.id,
          name: record.name,
          className: record.class?.name || 'Unknown Class',
        }}
        readOnly={false}
      />
    </div>
  );
};

export const TimetableEdit = () => (
  <Edit>
    <SimpleForm>
      {/* Display section information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Class</label>
          <ReferenceField reference="classes" source="classId" link={false}>
            <TextField source="name" />
          </ReferenceField>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Section</label>
          <TextField source="name" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Capacity</label>
          <TextField source="capacity" />
        </div>
      </div>
      
      {/* Timetable Calendar */}
      <TimetableCalendarField />
    </SimpleForm>
  </Edit>
);

export default TimetableEdit;