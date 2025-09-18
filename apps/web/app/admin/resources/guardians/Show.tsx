"use client";

import { 
  Show, 
  TextField,
  StatusBadge,
  RelationBadge
} from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";
import { 
  ArrayField,
  Datagrid,
  FunctionField,
  Labeled,
  useRecordContext
} from "react-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users, Phone, Mail, MapPin, Briefcase } from "lucide-react";

const GuardianDetails = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Guardian Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Labeled label="Full Name">
              <TextField source="name" />
            </Labeled>
            <Labeled label="Relation Type">
              <RelationBadge size="sm" />
            </Labeled>
            <Labeled label="Occupation">
              <FunctionField
                render={(record: any) => (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{record.occupation || '-'}</span>
                  </div>
                )}
              />
            </Labeled>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Labeled label="Primary Phone">
              <FunctionField
                render={(record: any) => (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{record.phoneNumber || record.phone || '-'}</span>
                  </div>
                )}
              />
            </Labeled>
            <Labeled label="Alternate Phone">
              <FunctionField
                render={(record: any) => 
                  record.alternatePhoneNumber ? (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{record.alternatePhoneNumber}</span>
                    </div>
                  ) : <span className="text-muted-foreground">-</span>
                }
              />
            </Labeled>
            <Labeled label="Email">
              <FunctionField
                render={(record: any) => (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{record.email || '-'}</span>
                  </div>
                )}
              />
            </Labeled>
            <Labeled label="Address">
              <FunctionField
                render={(record: any) => (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{record.address || '-'}</span>
                  </div>
                )}
              />
            </Labeled>
          </div>
        </CardContent>
      </Card>

      {/* Associated Students */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Associated Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ArrayField source="students">
            <Datagrid bulkActionButtons={false} className="overflow-x-auto">
              <FunctionField
                label="Student Name"
                render={(record: any) => {
                  const student = record?.student;
                  if (!student) return '-';
                  return `${student.firstName} ${student.lastName}` || '-';
                }}
              />
              <FunctionField
                label="Admission No"
                render={(record: any) => {
                  const student = record?.student;
                  if (!student) return '-';
                  return student.admissionNo || '-';
                }}
              />
              <FunctionField
                label="Class"
                className="hidden sm:table-cell"
                render={(record: any) => {
                  const student = record?.student;
                  if (!student?.class) return '-';
                  return student.class.name || '-';
                }}
              />
              <FunctionField
                label="Section"
                className="hidden sm:table-cell"
                render={(record: any) => {
                  const student = record?.student;
                  if (!student?.section) return '-';
                  return student.section.name || '-';
                }}
              />
              <TextField source="relation" label="Relation to Student" />
              <FunctionField
                label="Primary Contact"
                render={(record: any) => (
                  <span className={record.isPrimary ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    {record.isPrimary ? 'Yes' : 'No'}
                  </span>
                )}
              />
              <FunctionField
                label="Can Pickup"
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

export const GuardiansShow = () => (
  <Show>
    <GuardianDetails />
  </Show>
);

export default GuardiansShow;
