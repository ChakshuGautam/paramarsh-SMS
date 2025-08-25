"use client";

<<<<<<< HEAD
import { Show } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRecordContext } from "react-admin";
import { useCallback } from "react";
import { formatDate, formatCurrency, isInvoiceOverdue } from "@/lib/utils";
import { getStatusColor } from "@/lib/theme/colors";
import { 
  Receipt, 
  Calendar, 
  User, 
  GraduationCap, 
  CreditCard,
  Building,
  Phone,
  Mail,
  MapPin,
  Hash
} from "lucide-react";

export const InvoicesShow = () => (
  <Show
    actions={<ExportInvoiceButton />}
  >
    <InvoiceTemplate />
  </Show>
);

const InvoiceTemplate = () => {
  const record = useRecordContext();

  if (!record) return null;

  const student = record.student || {};
  const invoiceStatus = isInvoiceOverdue(record.dueDate, record.status) 
    ? 'overdue' 
    : record.status;
  const statusConfig = getStatusColor(invoiceStatus);

  return (
    <div className="max-w-4xl mx-auto print:max-w-none print:mx-0">
      {/* Header Section */}
      <Card className="mb-6">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold text-primary">
              Paramarsh School Management System
            </CardTitle>
          </div>
          <div className="flex items-center justify-center gap-2 text-lg">
            <Receipt className="h-5 w-5" />
            <span className="font-semibold">FEE INVOICE</span>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Invoice Number</p>
              <p className="font-mono text-lg font-semibold">{record.invoiceNumber || `INV-${record.id.slice(-8).toUpperCase()}`}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Issue Date</p>
              <p className="font-semibold">{formatDate(record.createdAt || new Date())}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Student Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-semibold text-lg">
                  {student.firstName} {student.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Student Name
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Admission No.</p>
                <div className="flex items-center gap-2">
                  <Hash className="h-3 w-3" />
                  <p className="font-mono font-semibold">{student.admissionNo || '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Roll Number</p>
                <p className="font-mono font-semibold">{student.rollNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Class</p>
                <p className="font-semibold">{student.class?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Section</p>
                <p className="font-semibold">{student.section?.name || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Period</span>
              <span className="font-semibold">{record.period || '-'}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Due Date</span>
              </div>
              <span className="font-semibold">{formatDate(record.dueDate)}</span>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold">Amount</span>
              <span className="font-bold text-primary text-xl">
                {formatCurrency(record.amount)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge 
                variant={statusConfig.badgeVariant}
                className={`${statusConfig.background} ${statusConfig.text}`}
              >
                {record.status?.toUpperCase() || 'PENDING'}
              </Badge>
            </div>

            {isInvoiceOverdue(record.dueDate, record.status) && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4">
                <p className="text-red-700 text-sm font-medium">
                  ⚠️ This invoice is overdue. Please make payment at your earliest convenience.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fee Breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Fee Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Fee Type</span>
              <span className="text-muted-foreground">Amount</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-2">
              <span>School Fee ({record.period})</span>
              <span className="font-semibold">{formatCurrency(record.amount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-3 bg-muted/30 px-4 rounded-md">
              <span className="font-semibold text-lg">Total Amount</span>
              <span className="font-bold text-xl text-primary">
                {formatCurrency(record.amount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Payment Instructions & Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Payment Instructions</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Payment can be made at the school office during working hours</li>
              <li>• Online payment options are available through the school portal</li>
              <li>• Please quote your invoice ID when making payment</li>
              <li>• Keep the receipt for your records</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-semibold">Phone</p>
                <p className="text-muted-foreground">+91 98765 43210</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-muted-foreground">fees@paramarsh.edu.in</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-semibold">Address</p>
                <p className="text-muted-foreground">123 School Street, City</p>
              </div>
            </div>
          </div>

          <Separator />
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Thank you for choosing Paramarsh School Management System</p>
            <p className="mt-1">Generated on {formatDate(new Date(), 'PPP')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

=======
import { Show, SimpleShowLayout, TextField } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { ReferenceField } from "@/components/admin/reference-field";
import { useCallback } from "react";

export const InvoicesShow = () => (
  <Show
    actions={
      <ExportInvoiceButton />
    }
  >
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <ReferenceField reference="students" source="studentId">
        <TextField source="firstName" label="Student" />
      </ReferenceField>
      <TextField source="period" label="Period" />
      <TextField source="dueDate" label="Due" />
      <TextField source="amount" label="Amount" />
      <TextField source="status" label="Status" />
    </SimpleShowLayout>
  </Show>
);

>>>>>>> origin/main
const ExportInvoiceButton = () => {
  const handleExport = useCallback(async () => {
    const id = window.location.pathname.split('/').pop();
    if (!id) return;
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4010';
    const res = await fetch(`${base}/fees/invoices/${id}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return;
    const { data } = await res.json();
    if (data?.uploadUrl) {
      // For now, just open the presigned URL in a new tab (would normally upload generated PDF)
      window.open(data.uploadUrl, '_blank');
    } else if (data?.url) {
      window.open(data.url, '_blank');
    }
  }, []);
<<<<<<< HEAD
  
  return (
    <Button onClick={handleExport} variant="secondary" className="flex items-center gap-2">
      <Receipt className="h-4 w-4" />
      Export PDF
    </Button>
  );
};

export default InvoicesShow;
=======
  return (
    <Button onClick={handleExport} variant="secondary">Export PDF</Button>
  );
};

export default InvoicesShow;





>>>>>>> origin/main
