"use client";

import { 
  Show, 
  SimpleShowLayout, 
  TextField, 
  ArrayField,
} from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AcademicYearsShow = () => (
  <Show>
    <SimpleShowLayout>
      <Card>
        <CardHeader>
          <CardTitle>Academic Year Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField source="name" label="Academic Year Name" />
          <TextField source="isActive" label="Active Status" />
          <TextField source="startDate" label="Start Date" />
          <TextField source="endDate" label="End Date" />
          <TextField source="createdAt" label="Created At" />
          <TextField source="updatedAt" label="Last Updated" />
        </CardContent>
      </Card>
      
    </SimpleShowLayout>
  </Show>
);

export default AcademicYearsShow;