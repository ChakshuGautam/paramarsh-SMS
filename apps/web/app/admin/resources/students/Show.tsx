"use client";

import { 
  Show, 
  SimpleShowLayout, 
  TextField,
  StatusBadge,
  GenderBadge
} from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";
import { 
  ArrayField,
  Datagrid,
  DateField,
  FunctionField,
  Labeled,
  useRecordContext
} from "react-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, GraduationCap, Users, Phone, Mail, MapPin } from "lucide-react";

const StudentDetails = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Labeled label="Admission No">
              <TextField source="admissionNo" />
            </Labeled>
            <Labeled label="Roll Number">
              <TextField source="rollNumber" />
            </Labeled>
            <Labeled label="First Name">
              <TextField source="firstName" />
            </Labeled>
            <Labeled label="Last Name">
              <TextField source="lastName" />
            </Labeled>
            <Labeled label="Date of Birth">
              <DateField source="dob" />
            </Labeled>
            <Labeled label="Gender">
              <GenderBadge size="sm" />
            </Labeled>
            <Labeled label="Status">
              <StatusBadge size="sm" />
            </Labeled>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Academic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Labeled label="Class">
              <ReferenceField reference="classes" source="classId">
                <TextField source="name" />
              </ReferenceField>
            </Labeled>
            <Labeled label="Section">
              <ReferenceField reference="sections" source="sectionId">
                <TextField source="name" />
              </ReferenceField>
            </Labeled>
          </div>
        </CardContent>
      </Card>

      {/* Guardian Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Guardian Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ArrayField source="guardians">
            <Datagrid bulkActionButtons={false} className="overflow-x-auto">
              <FunctionField
                label="Name"
                render={(record: any) => {
                  const guardian = record?.guardian;
                  if (!guardian) return '-';
                  return guardian.name || '-';
                }}
              />
              <TextField source="relation" label="Relation" />
              <FunctionField
                label="Contact"
                render={(record: any) => {
                  const guardian = record?.guardian;
                  if (!guardian) return '-';
                  return (
                    <div className="space-y-1">
                      {guardian.phoneNumber && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span className="text-sm">{guardian.phoneNumber}</span>
                        </div>
                      )}
                      {guardian.alternatePhoneNumber && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {guardian.alternatePhoneNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              <FunctionField
                label="Email"
                className="hidden sm:table-cell"
                render={(record: any) => {
                  const guardian = record?.guardian;
                  if (!guardian?.email) return '-';
                  return (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="text-sm">{guardian.email}</span>
                    </div>
                  );
                }}
              />
              <FunctionField
                label="Address"
                className="hidden lg:table-cell"
                render={(record: any) => {
                  const guardian = record?.guardian;
                  if (!guardian?.address) return '-';
                  return (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="text-sm">{guardian.address}</span>
                    </div>
                  );
                }}
              />
              <FunctionField
                label="Primary"
                render={(record: any) => (
                  <span className={record.isPrimary ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    {record.isPrimary ? 'Yes' : 'No'}
                  </span>
                )}
              />
              <FunctionField
                label="Pickup"
                className="hidden md:table-cell"
                render={(record: any) => (
                  <span className={record.canPickup ? 'text-green-600' : 'text-gray-400'}>
                    {record.canPickup ? 'Yes' : 'No'}
                  </span>
                )}
              />
            </Datagrid>
          </ArrayField>
        </CardContent>
      </Card>
    </div>
  );
};

export const StudentsShow = () => (
  <Show>
    <StudentDetails />
  </Show>
);

export default StudentsShow;
