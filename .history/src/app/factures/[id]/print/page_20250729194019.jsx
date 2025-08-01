'use client';

import { useState, useEffect } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ProtectedRoute from '@/components/ProtectedRoute';

const InvoicePrint = ({ params }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoices/${params.id}?t=${Date.now()}`);
        if (!res.ok) throw new Error('Échec de la récupération de la facture');
        const data = await res.json();
        console.log('Fetched invoice for print:', data); // Log invoice
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

  useEffect(() => {
    if (!loading && invoice) {
      window.print();
    }
  }, [loading, invoice]);

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
      <div className="border rounded p-4">
        <h1 className="text-2xl font-bold mb-4">Facture #{invoice.invoiceNumber}</h1>
        <p><strong>Entreprise:</strong> {invoice.companyName}</p>
        <p><strong>Adresse:</strong> {invoice.companyAddress}</p>
        <p><strong>Email:</strong> {invoice.companyEmail}</p>
        <p><strong>Téléphone:</strong> {invoice.companyPhone}</p>
        <p><strong>Matricule Fiscale:</strong> {invoice.matriculeFiscale}</p>
        <hr className="my-4" />
        <p><strong>Client:</strong> {invoice.clientName}</p>
        <p><strong>Adresse du Client:</strong> {invoice.clientAddress}</p>
        <p><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
        <h5 className="mt-4">Articles:</h5>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Description</th>
              <th className="border p-2">Quantité</th>
              <th className="border p-2">Prix Unitaire (TND)</th>
              <th className="border p-2">Total (TND)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td className="border p-2">{item.description}</td>
                <td className="border p-2">{item.quantity}</td>
                <td className="border p-2">{(item.unitPrice != null ? item.unitPrice : 0).toFixed(3)}</td>
                <td className="border p-2">{(item.total != null ? item.total : 0).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4"><strong>Total HT (TND):</strong> {(invoice.total != null ? invoice.total : 0).toFixed(3)}</p>
        <p><strong>TVA ({invoice.taxRate}%):</strong> {(invoice.taxAmount != null ? invoice.taxAmount : 0).toFixed(3)}</p>
        <p><strong>Timbre Fiscal (TND):</strong> {(invoice.timbreFiscal != null ? invoice.timbreFiscal : 0).toFixed(3)}</p>
        <p><strong>Total TTC (TND):</strong> {invoice.grandTotal != null ? invoice.grandTotal.toFixed(3) : '0.000'}</p>
      </div>
    </Container>
  );
};

export default ProtectedRoute(InvoicePrint);