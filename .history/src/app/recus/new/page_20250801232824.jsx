'use client';

// src/app/receipts/page.jsx (or wherever InvoiceForm is used)
import dynamic from 'next/dynamic';

// Disable SSR for InvoiceForm
const ReceiptForm = dynamic(() => import('../components/'), { ssr: false });


export default function NewReceipt() {
  return <ReceiptForm />;
}