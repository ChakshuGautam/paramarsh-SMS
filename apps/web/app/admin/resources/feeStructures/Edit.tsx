"use client";

import { 
  Edit, 
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRecordContext } from "react-admin";
import { formatCurrency } from "@/lib/utils";

const FeeComponentsInput = () => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="text-lg">Fee Components</CardTitle>
      <p className="text-sm text-muted-foreground">
        Add and manage individual fee components for this grade/class
      </p>
    </CardHeader>
    <CardContent>
      <ArrayInput source="components">
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

const FeeStructureSummary = () => {
  const record = useRecordContext();
  
  if (!record?.components || !Array.isArray(record.components)) {
    return null;
  }

  const totalAmount = record.components.reduce((sum: number, component: any) => {
    return sum + (Number(component.amount) || 0);
  }, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Fee Structure Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Components</p>
            <Badge variant="outline" className="text-base">
              {record.components.length} components
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Annual Fee</p>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalAmount)}
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Component Breakdown:</p>
          {record.components.map((component: any, index: number) => (
            <div key={index} className="flex justify-between items-center py-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{component.name}</span>
                {component.type && (
                  <Badge variant="secondary" className="text-xs">
                    {component.type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Badge>
                )}
              </div>
              <span className="font-semibold">
                {formatCurrency(component.amount || 0)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const FeeStructuresEdit = () => (
  <Edit>
    <SimpleForm>
      <div className="space-y-6">
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

        {/* Summary */}
        <FeeStructureSummary />
      </div>
    </SimpleForm>
  </Edit>
);

export default FeeStructuresEdit;





