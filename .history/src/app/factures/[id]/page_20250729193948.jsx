'use client';

import { useState, useEffect } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ProtectedRoute from '@/components/ProtectedRoute';

const InvoiceView = ({ params }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoices/${params.id}?t=${Date.now()}`);
        if (!res.ok) throw new Error('Échec de la récupération de la facture');
        const data = await res.json();
        console.log('Fetched invoice:', data); // Log invoice
        setInvoice(data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération de la facture:', error);
        toast.error('Erreur lors de la récupération de la facture');
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [params.id]);

  if (loading) {
    return (
      <Container className="my-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!invoice) {
    return <Container className="my-4">Facture non trouvée</Container>;
  }

  return (
    <Container className="my-4">
      <h1 className="text-2xl font-bold mb-4">Détails de la Facture #{invoice.invoiceNumber}</h1>
      <div className="border rounded p-4">
        <p><strong>Client:</strong> {invoice.clientName}</p>
        <p><strong>Adresse:</strong> {invoice.clientAddress}</p>
        <p><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
        <p><strong>Total (TND):</strong> {invoice.grandTotal != null ? invoice.grandTotal.toFixed(3) : '0.000'}</p>
        <h5 className="mt-4">Articles:</h5>
        <ul>
          {invoice.items.map((item, index) => (
            <li key={index}>
              {item.description}: {item.quantity} x {(item.unitPrice != null ? item.unitPrice : 0).toFixed(3)} TND = {(item.total != null ? item.total : 0).toFixed(3)} TND
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
};

export default ProtectedRoute(InvoiceView);