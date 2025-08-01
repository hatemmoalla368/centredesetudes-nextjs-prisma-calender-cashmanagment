'use client';

import { useState, useEffect } from 'react';
import { Button, Container, Table, Form } from 'react-bootstrap';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

const InvoicesList =() => {
 const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInvoices, setFilteredInvoices] = useState([]);
const { isAuthenticated } = useAuth();
 useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch('/api/invoices');
        if (!res.ok) throw new Error('Failed to fetch invoices');
        const data = await res.json();
        setInvoices(data);
        setFilteredInvoices(data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        toast.error('Erreur lors du chargement des factures');
      }
    };
    fetchInvoices();
  }, []);

  // Filter invoices based on search term
  useEffect(() => {
    const filtered = invoices.filter(
      (invoice) =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInvoices(filtered);
  }, [searchTerm, invoices]);

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return;
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete invoice');
      setInvoices(invoices.filter((invoice) => invoice.id !== id));
      setFilteredInvoices(filteredInvoices.filter((invoice) => invoice.id !== id));
      toast.success('Facture supprimée avec succès');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Liste des Factures</h2>
        <Link href="/factures/new">
          <Button variant="primary">
            <i className="bi bi-plus-circle me-2"></i> Nouvelle Facture
          </Button>
        </Link>
      </div>

      <Form.Group className="mb-4">
        <Form.Label>Rechercher une facture</Form.Label>
        <Form.Control
          type="text"
          placeholder="Rechercher par numéro ou nom du client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Numéro</th>
            <th>Client</th>
            <th>Date</th>
            <th>Total (TND)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>{invoice.id}</td>
              <td>{invoice.invoiceNumber}</td>
              <td>{invoice.clientName}</td>
              <td>{new Date(invoice.date).toLocaleDateString('fr-FR')}</td>
              <td>{invoice.grandTotal.toFixed(3)}</td>
              <td>
                <Link href={`/invoices/${invoice.id}`}>
                  <Button variant="info" size="sm" className="me-2">
                    <i className="bi bi-eye"></i>
                  </Button>
                </Link>
                <Link href={`/invoices/${invoice.id}/edit`}>
                  <Button variant="warning" size="sm" className="me-2">
                    <i className="bi bi-pencil"></i>
                  </Button>
                </Link>
                <Link href={`/invoices/${invoice.id}/print`}>
                  <Button variant="success" size="sm" className="me-2">
                    <i className="bi bi-printer"></i>
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(invoice.id)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
export default ProtectedRoute(InvoicesList)