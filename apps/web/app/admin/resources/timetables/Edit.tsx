"use client";

import React from 'react';
import { Edit, SimpleForm, TextInput, NumberInput, SelectInput } from "@/components/admin";
import { ReferenceInput } from "@/components/admin/reference-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";

export const TimetableEdit = () => (
  <Edit>
    <SimpleForm>
      <ReferenceInput reference="sections" source="sectionId" label="Section">
        <AutocompleteInput 
          optionText={(record: any) => `${record.class?.name || ''} - ${record.name}`}
        />
      </ReferenceInput>
      
      <SelectInput 
        source="dayOfWeek" 
        label="Day of Week"
        choices={[
          { id: 1, name: 'Monday' },
          { id: 2, name: 'Tuesday' },
          { id: 3, name: 'Wednesday' },
          { id: 4, name: 'Thursday' },
          { id: 5, name: 'Friday' },
          { id: 6, name: 'Saturday' },
        ]}
      />
      
      <NumberInput source="periodNumber" label="Period Number" min={1} max={8} />
      
      <TextInput source="startTime" label="Start Time" placeholder="HH:MM" />
      <TextInput source="endTime" label="End Time" placeholder="HH:MM" />
      
      <ReferenceInput reference="subjects" source="subjectId" label="Subject">
        <AutocompleteInput optionText="name" />
      </ReferenceInput>
      
      <ReferenceInput reference="teachers" source="teacherId" label="Teacher">
        <AutocompleteInput 
          optionText={(record: any) => 
            record.staff ? `${record.staff.firstName} ${record.staff.lastName}` : record.id
          }
        />
      </ReferenceInput>
      
      <ReferenceInput reference="rooms" source="roomId" label="Room">
        <AutocompleteInput optionText="name" />
      </ReferenceInput>
      
      <SelectInput 
        source="isBreak" 
        label="Is Break?"
        choices={[
          { id: false, name: 'No' },
          { id: true, name: 'Yes' },
        ]}
      />
      
      <TextInput 
        source="breakType" 
        label="Break Type" 
        placeholder="e.g., Lunch Break, Recess"
        helperText="Only used if 'Is Break' is Yes"
      />
    </SimpleForm>
  </Edit>
);

export default TimetableEdit;