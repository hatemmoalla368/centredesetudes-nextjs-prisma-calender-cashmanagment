
import { prisma } from '@/app/lib/prisma';

import ReceiptForm from '@/components/ReceiptForm';
import { notFound } from 'next/navigation';

const ReceiptEdit  = async({ params }) => {
  try {
    const receipt = await prisma.receipt.findUnique({
      where: { id: parseInt(params.id, 10) },
    });

    if (!receipt) {
      notFound();
    }

    // Ensure paymentMethod is properly formatted
    const formattedReceipt = {
      ...receipt,
      paymentMethod: {
        type: receipt.paymentMethod?.type || 'Espèces',
        chequeNumber: receipt.paymentMethod?.chequeNumber || '',
        bank: receipt.paymentMethod?.bank || '',
        transactionNumber: receipt.paymentMethod?.transactionNumber || '',
        otherDetails: receipt.paymentMethod?.otherDetails || '',
      },
    };

    return <ReceiptForm initialReceipt={formattedReceipt} />;
  } catch (error) {
    console.error('Error fetching receipt for edit:', error);
    notFound();
  }
}
export default ReceiptEdit