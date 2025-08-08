# Screen Specs — Fees & Payments

1) Fee Master
- Route: /fees/master
- Define heads (taxable/refundable), structures by class/category/schedule; transport linkage
- Preview: sample invoices per class/student category

2) Invoices
- Route: /fees/invoices
- List with filters (status, due bucket, class); bulk actions (issue, remind); offline payment posting

3) Payments
- Route: /fees/payments
- Gateway settlements, reconciliation; mismatches workflow; refunds initiation

4) Parent Payment
- Route: /portal/fees/:invoice_id
- Checkout: UPI, cards, netbanking; retries; save method tokenization; receipts

