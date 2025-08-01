'use client';

import { useState, useEffect } from 'react';
import { Container, Spinner, Form, Button as BootstrapButton } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Button from '@mui/material/Button';
import ProtectedRoute from '@/components/ProtectedRoute';

const InvoiceEdit = ({ params }) => {
  const [invoice, setInvoice] = useState(null);
  const [formData, setFormData] = useState({
    clientName: '',
    clientAddress: '',
    invoiceNumber: '',
    date: '',
    taxRate: 19,
    items: [],
    total: 0,
    taxAmount: 0,
    grandTotal: 0,
    timbreFiscal: 0.6,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoices/${params.id}?t=${Date.now()}`);
        if (!res.ok) throw new Error('Échec de la récupération de la facture');
        const data = await res.json();
        console.log('Fetched invoice for edit:', data); // Log invoice
        setInvoice(data);
        setFormData({
          clientName: data.clientName,
          clientAddress: data.clientAddress,
          invoiceNumber: data.invoiceNumber,
          date: new Date(data.date).toISOString().split('T')[0],
          taxRate: data.taxRate || 19,
          items: data.items || [],
          total: data.total || 0,
          taxAmount: data.taxAmount || 0,
          grandTotal: data.grandTotal || 0,
          timbreFiscal: data.timbreFiscal || 0.6,
        });
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération de la facture:', error);
        toast.error('Erreur lors de la récupération de la facture');
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [params.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'taxRate' || name === 'total' || name === 'taxAmount' || name === 'grandTotal' || name === 'timbreFiscal'
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'quantity' || field === 'unitPrice' || field === 'total' ? parseFloat(value) || 0 : value,
    };
    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
      total: updatedItems.reduce((sum, item) => sum + (item.total || 0), 0),
      taxAmount: updatedItems.reduce((sum, item) => sum + (item.total || 0), 0) * (formData.taxRate / 100),
      grandTotal: updatedItems.reduce((sum, item) => sum + (item.total || 0), 0) * (1 + formData.taxRate / 100) + (formData.timbreFiscal || 0),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/invoices/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la mise à jour de la facture');
      }
      toast.success('Facture mise à jour avec succès');
      window.location.href = `/factures/${params.id}`;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la facture:', error);
      toast.error(error.message);
    }
  };

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
      <h1 className="text-2xl font-bold mb-4">Modifier la Facture #{invoice.invoiceNumber}</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Numéro de Facture</Form.Label>
          <Form.Control
            type="text"
            name="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Nom du Client</Form.Label>
          <Form.Control
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Adresse du Client</Form.Label>
          <Form.Control
            type="text"
            name="clientAddress"
            value={formData.clientAddress}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Taux de TVA (%)</Form.Label>
          <Form.Control
            type="number"
            name="taxRate"
            value={formData.taxRate}
            onChange={handleChange}
            step="0.01"
            min="0"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Timbre Fiscal (TND)</Form.Label>
          <Form.Control
            type="number"
            name="timbreFiscal"
            value={formData.timbreFiscal}
            onChange={handleChange}
            step="0.01"
            min="0"
          />
        </Form.Group>
        <h5 className="mt-4">Articles</h5>
        {formData.items.map((item, index) => (
          <div key={index} className="border p-3 mb-3 rounded">
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantité</Form.Label>
              <Form.Control
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                min="1"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Prix Unitaire (TND)</Form.Label>
              <Form.Control
                type="number"
                value={item.unitPrice}
                onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                step="0.01"
                min="0"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Total (TND)</Form.Label>
              <Form.Control
                type="number"
                value={item.total}
                onChange={(e) => handleItemChange(index, 'total', e.target.value)}
                step="0.01"
                min="0"
              />
            </Form.Group>
          </div>
        ))}
        <p><strong>Total HT (TND):</strong> {(formData.total != null ? formData.total : 0).toFixed(3)}</p>
        <p><strong>TVA ({formData.taxRate}%):</strong> {(formData.taxAmount != null ? formData.taxAmount : 0).toFixed(3)}</p>
        <p><strong>Timbre Fiscal (TND):</strong> {(formData.timbreFiscal != null ? formData.timbreFiscal : 0).toFixed(3)}</p>
        <p><strong>Total TTC (TND):</strong> {(formData.grandTotal != null ? formData.grandTotal : 0).toFixed(3)}</p>
        <div className="mt-4">
          <Button type="submit" variant="contained" color="primary" className="bg-blue-600 hover:bg-blue-700">
            Enregistrer
          </Button>
          <BootstrapButton
            variant="secondary"
            className="ms-2"
            onClick={() => window.location.href = `/factures/${params.id}`}
          >
            Annuler
          </BootstrapButton>
        </div>
      </Form>
    </Container>
  );
};

export default ProtectedRoute(InvoiceEdit);