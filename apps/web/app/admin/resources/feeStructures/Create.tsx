"use client";

<<<<<<< HEAD
import { 
  Create, 
  SimpleForm, 
  ReferenceInput,
  AutocompleteInput,
  TextInput,
  NumberInput,
  SelectInput,
  ArrayInput,
  required 
} from "@/components/admin";
import { SimpleFormIterator } from "@/components/admin/simple-form-iterator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const FeeComponentsInput = () => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="text-lg">Fee Components</CardTitle>
      <p className="text-sm text-muted-foreground">
        Add and manage individual fee components for this grade/class
      </p>
    </CardHeader>
    <CardContent>
      <ArrayInput source="components" defaultValue={[]}>
        <SimpleFormIterator 
          disableReordering={false}
          removeLabel="Remove Component"
          addLabel="Add Fee Component"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <TextInput 
                  source="name" 
                  label="Component Name"
                  placeholder="e.g. Tuition Fee, Lab Fee"
                  validate={required()}
                />
              </div>
              <div className="space-y-2">
                <SelectInput
                  source="type"
                  label="Fee Type"
                  choices={[
                    { id: 'tuition', name: 'Tuition Fee' },
                    { id: 'lab', name: 'Laboratory Fee' },
                    { id: 'library', name: 'Library Fee' },
                    { id: 'sports', name: 'Sports Fee' },
                    { id: 'transport', name: 'Transport Fee' },
                    { id: 'examination', name: 'Examination Fee' },
                    { id: 'development', name: 'Development Fee' },
                    { id: 'miscellaneous', name: 'Miscellaneous' },
                    { id: 'other', name: 'Other' },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <NumberInput 
                  source="amount" 
                  label="Amount (₹)"
                  validate={required()}
                  min={0}
                  step={1}
                />
              </div>
            </div>
          </div>
        </SimpleFormIterator>
      </ArrayInput>
    </CardContent>
  </Card>
);
=======
import { Create, SimpleForm, TextInput } from "@/components/admin";
>>>>>>> origin/main

export const FeeStructuresCreate = () => (
  <Create>
    <SimpleForm>
<<<<<<< HEAD
      <div className="space-y-6">
        {/* Information Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Create a comprehensive fee structure by defining the grade/class and adding individual fee components.
            Each component can have different types and amounts to create detailed billing structures.
          </AlertDescription>
        </Alert>

        {/* Basic Information */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure the basic details of this fee structure
            </p>
          </CardHeader>
          <CardContent>
            <ReferenceInput source="gradeId" reference="classes" validate={required()}>
              <AutocompleteInput optionText="name" label="Grade/Class" />
            </ReferenceInput>
          </CardContent>
        </Card>

        {/* Fee Components */}
        <FeeComponentsInput />
      </div>
=======
      <TextInput source="gradeId" label="Grade" />
      <TextInput source="components" label="Components" />
>>>>>>> origin/main
    </SimpleForm>
  </Create>
);

export default FeeStructuresCreate;





