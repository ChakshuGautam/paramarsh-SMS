"use client";

import { 
  Create,
  SimpleForm,
  TextInput, 
  SelectInput,
  ReferenceInput,
  ReferenceArrayInput,
  AutocompleteInput,
  AutocompleteArrayInput,
  required,
  email
} from "@/components/admin";
import { GUARDIAN_RELATION } from "@/lib/constants";
import { useState } from "react";

export const GuardiansCreate = () => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Build filter for students based on selected class and section
  const studentFilter: any = {};
  if (selectedClass) studentFilter.classId = selectedClass;
  if (selectedSection) studentFilter.sectionId = selectedSection;

  return (
    <Create>
      <SimpleForm className="max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput 
            source="name" 
            label="Full Name" 
            placeholder="e.g. Mr. Rajesh Kumar"
            validate={required()} 
          />
          <SelectInput 
            source="relation" 
            label="Default Relation" 
            placeholder="Select relation type"
            choices={[
              { id: GUARDIAN_RELATION.FATHER, name: 'Father' },
              { id: GUARDIAN_RELATION.MOTHER, name: 'Mother' },
              { id: GUARDIAN_RELATION.GUARDIAN, name: 'Guardian' },
              { id: GUARDIAN_RELATION.GRANDFATHER, name: 'Grandfather' },
              { id: GUARDIAN_RELATION.GRANDMOTHER, name: 'Grandmother' },
              { id: GUARDIAN_RELATION.UNCLE, name: 'Uncle' },
              { id: GUARDIAN_RELATION.AUNT, name: 'Aunt' },
              { id: GUARDIAN_RELATION.OTHER, name: 'Other' },
            ]}
            validate={required()}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput 
            source="phoneNumber" 
            label="Phone Number" 
            placeholder="e.g. +91-9876543210"
            validate={required()} 
          />
          <TextInput 
            source="alternatePhoneNumber" 
            label="Alternate Phone" 
            placeholder="e.g. +91-9876543211"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput 
            source="email" 
            label="Email Address" 
            placeholder="e.g. rajesh.kumar@example.com"
            validate={email()} 
          />
          <TextInput 
            source="occupation" 
            label="Occupation" 
            placeholder="e.g. Software Engineer"
          />
        </div>

        <TextInput 
          source="address" 
          label="Address" 
          placeholder="e.g. 123, ABC Colony, New Delhi"
          multiline 
          className="col-span-full"
        />

        <div className="col-span-full border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold mb-4">Link Students (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <ReferenceInput 
              source="filterClass" 
              reference="classes" 
              label="Filter by Class"
              alwaysOn
            >
              <AutocompleteInput 
                optionText="name"
                optionValue="id"
                placeholder="Select a class to filter students"
                onChange={(value) => {
                  setSelectedClass(value);
                  setSelectedSection(null); // Reset section when class changes
                }}
              />
            </ReferenceInput>

            {selectedClass && (
              <ReferenceInput 
                source="filterSection" 
                reference="sections"
                filter={{ classId: selectedClass }}
                label="Filter by Section"
                alwaysOn
              >
                <AutocompleteInput 
                  optionText="name"
                  optionValue="id"
                  placeholder="Select a section to filter students"
                  onChange={(value) => setSelectedSection(value)}
                />
              </ReferenceInput>
            )}
          </div>

          <ReferenceArrayInput 
            source="studentIds" 
            reference="students"
            filter={studentFilter}
            label="Select Students"
          >
            <AutocompleteArrayInput 
              optionText={(record) => {
                const className = record.class?.name || '';
                const sectionName = record.section?.name || '';
                return `${record.firstName} ${record.lastName} (${className} - ${sectionName})`;
              }}
              optionValue="id"
              placeholder={selectedClass ? "Search and select students from filtered list" : "Select a class first to filter students"}
              disabled={!selectedClass}
            />
          </ReferenceArrayInput>
        </div>
      </SimpleForm>
    </Create>
  );
};

export default GuardiansCreate;
