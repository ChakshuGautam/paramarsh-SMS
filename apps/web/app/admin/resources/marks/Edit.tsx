"use client";

import { Edit, SimpleForm, TextInput } from "@/components/admin";
import { ReferenceInput } from "@/components/admin/reference-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";

export const MarksEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" label="ID" disabled />
      <ReferenceInput source="studentId" reference="students" label="Student">
        <AutocompleteInput 
          optionText={(record: any) => 
            `${record.firstName} ${record.lastName}`
          } 
        />
      </ReferenceInput>
      <ReferenceInput source="sessionId" reference="examSessions" label="Exam Session">
        <AutocompleteInput optionText="id" />
      </ReferenceInput>
      <TextInput source="rawMarks" label="Raw Marks" />
      <TextInput source="grade" label="Grade" />
      <TextInput source="comments" label="Comments" multiline rows={3} />
    </SimpleForm>
  </Edit>
);

export default MarksEdit;