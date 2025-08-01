

// src/app/receipts/page.jsx (or wherever InvoiceForm is used)
import dynamic from 'next/dynamic';

// Disable SSR for InvoiceForm
const InvoiceForm = dynamic(() => import('../../../components/InvoiceForm'), { ssr: false });

const page = () => {
  return (
    <div>
      <InvoiceForm/>
    </div>
  )
}

export default page
