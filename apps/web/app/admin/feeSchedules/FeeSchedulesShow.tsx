import {
  Show,
  SimpleShowLayout,
  TextField,
  NumberField,
  ReferenceField
} from '@/components/admin';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

export const FeeSchedulesShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <Card>
          <CardHeader>
            <CardTitle>Fee Schedule Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField source="id" label="ID" />
            
            <ReferenceField 
              source="feeStructureId" 
              reference="feeStructures" 
              label="Fee Structure"
            >
              <TextField source="name" />
            </ReferenceField>
            
            <TextField source="recurrence" label="Recurrence" />
            
            <NumberField source="dueDayOfMonth" label="Due Day of Month" />
            
            <TextField 
              source="startDate" 
              label="Start Date"
              render={(record) => formatDate(record.startDate)}
            />
            
            <TextField 
              source="endDate" 
              label="End Date"
              render={(record) => formatDate(record.endDate)}
            />
            
            <ReferenceField 
              source="classId" 
              reference="classes" 
              label="Class"
            >
              <TextField source="name" />
            </ReferenceField>
            
            <ReferenceField 
              source="sectionId" 
              reference="sections" 
              label="Section"
            >
              <TextField source="name" />
            </ReferenceField>
            
            <TextField 
              source="status" 
              label="Status"
              render={(record) => (
                <Badge 
                  variant={record.status === 'active' ? 'default' : 
                          record.status === 'expired' ? 'destructive' : 'secondary'}
                >
                  {record.status}
                </Badge>
              )}
            />
            
            <TextField 
              source="createdAt" 
              label="Created At"
              render={(record) => formatDate(record.createdAt, 'PPpp')}
            />
            
            <TextField 
              source="updatedAt" 
              label="Updated At"
              render={(record) => formatDate(record.updatedAt, 'PPpp')}
            />
          </CardContent>
        </Card>
      </SimpleShowLayout>
    </Show>
  );
};