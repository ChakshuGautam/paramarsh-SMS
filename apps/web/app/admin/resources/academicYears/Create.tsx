"use client";

import { 
  Create, 
  SimpleForm, 
  TextInput, 
  DateInput,
  BooleanInput,
} from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AcademicYearsCreate = () => (
  <Create>
    <SimpleForm>
      <div className="w-full flex flex-col gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Year Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput 
              source="name" 
              label="Academic Year Name" 
              required 
              fullWidth 
              helperText="e.g., 2024-25"
            />
            <BooleanInput 
              source="isActive" 
              label="Set as Active" 
              helperText="Only one academic year can be active at a time"
            />
            <DateInput 
              source="startDate" 
              label="Start Date" 
              required 
              fullWidth 
            />
            <DateInput 
              source="endDate" 
              label="End Date" 
              required 
              fullWidth 
            />
          </CardContent>
        </Card>

      </div>
    </SimpleForm>
  </Create>
);

export default AcademicYearsCreate;