import {
  Create,
  SimpleForm,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  NumberInput,
  BooleanInput,
  required
} from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SubjectsCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <div className="w-full flex flex-col gap-6">
          {/* Basic Subject Information */}
          <Card>
            <CardHeader>
              <CardTitle>New Subject</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput 
                source="code" 
                label="Subject Code"
                placeholder="e.g. MATH101, ENG201"
                validate={required()} 
                fullWidth
              />
              <TextInput 
                source="name" 
                label="Subject Name"
                placeholder="e.g. Advanced Mathematics"
                validate={required()} 
                fullWidth
              />
              <div className="md:col-span-2">
                <TextInput 
                  source="description" 
                  label="Description"
                  placeholder="Brief description of the subject"
                  multiline
                  rows={3}
                  fullWidth
                />
              </div>
              <NumberInput 
                source="credits" 
                label="Credits"
                placeholder="e.g. 3"
                min={1}
                max={10}
                fullWidth
              />
              <BooleanInput 
                source="isElective" 
                label="Is Elective Subject"
              />
              <div className="md:col-span-2">
                <TextInput 
                  source="prerequisites" 
                  label="Prerequisites"
                  placeholder="e.g. Basic Mathematics, Science Foundation"
                  multiline
                  rows={2}
                  fullWidth
                />
              </div>
            </CardContent>
          </Card>

          {/* Class and Teacher Assignments */}
          <Card>
            <CardHeader>
              <CardTitle>Class & Teacher Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReferenceInput 
                  reference="classes" 
                  source="classId" 
                  label="Assign to Class"
                >
                  <AutocompleteInput 
                    optionText={(record) => `${record.name} (Grade ${record.gradeLevel})`}
                    placeholder="Search for classes (e.g. Class 10)"
                    filterToQuery={searchText => ({ q: searchText })}
                    fullWidth
                  />
                </ReferenceInput>
                
                <ReferenceInput 
                  reference="teachers" 
                  source="teacherId" 
                  label="Subject Teacher"
                >
                  <AutocompleteInput 
                    optionText={(record) => `${record.staff?.fullName || record.name} (${record.staff?.email || record.email})`}
                    placeholder="Search for teachers"
                    filterToQuery={searchText => ({ q: searchText })}
                    fullWidth
                  />
                </ReferenceInput>
              </div>
              
              <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                <strong>Note:</strong> Select both class and teacher to automatically create the subject assignment. 
                You can add more class-teacher combinations after creation.
              </div>
            </CardContent>
          </Card>
        </div>
      </SimpleForm>
    </Create>
  );
};