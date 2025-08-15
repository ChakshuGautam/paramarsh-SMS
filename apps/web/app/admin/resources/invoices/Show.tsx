"use client";

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
  return (
    <Button onClick={handleExport} variant="secondary">Export PDF</Button>
  );
};

export default InvoicesShow;





