'use client';

import { useState, useEffect } from 'react';
import { Button, Container, Table, Form } from 'react-bootstrap';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
const ReceiptsList =() => {
const router = useRouter();
  const [receipts, setReceipts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReceipts, setFilteredReceipts] = useState([]);
const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const res = await fetch('/api/receipts');
        if (!res.ok) throw new Error('Failed to fetch receipts');
        const data = await res.json();
        setReceipts(data);
        setFilteredReceipts(data);
      } catch (error) {
        console.error('Error fetching receipts:', error);
        toast.error('Erreur lors du chargement des reçus');
      }
    };
    fetchReceipts();
  }, []);

  // Filter receipts based on search term
  useEffect(() => {
    const filtered = receipts.filter(
      (receipt) =>
        receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.payerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReceipts(filtered);
  }, [searchTerm, receipts]);

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce reçu ?')) return;
    try {
      const res = await fetch(`/api/receipts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete receipt');
      setReceipts(receipts.filter((receipt) => receipt.id !== id));
      setFilteredReceipts(filteredReceipts.filter((receipt) => receipt.id !== id));
      toast.success('Reçu supprimé avec succès');
    } catch (error) {
      console.error('Error deleting receipt:', error);
      toast.error('Erreur lors de la suppression');
    }
  };


  
  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Liste des Reçus</h2>
        <Link href="/recus/new">
          <Button variant="primary">
            <i className="bi bi-plus-circle me-2"></i> Nouveau Reçu
          </Button>
        </Link>
      </div>

      <Form.Group className="mb-4">
        <Form.Label>Rechercher un reçu</Form.Label>
        <Form.Control
          type="text"
          placeholder="Rechercher par numéro ou nom du payeur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Numéro</th>
            <th>Payeur</th>
            <th>Date</th>
            <th>Montant (TND)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredReceipts.map((receipt) => (
            <tr key={receipt.id}>
              <td>{receipt.id}</td>
              <td>{receipt.receiptNumber}</td>
              <td>{receipt.payerName}</td>
              <td>{new Date(receipt.paymentDate).toLocaleDateString('fr-FR')}</td>
              <td>{receipt.amount.toFixed(3)}</td>
              <td>
                <Link href={`/recus/${receipt.id}`}>
                  <Button variant="info" size="sm" className="me-2">
                    <i className="bi bi-eye"></i>
                  </Button>
                </Link>
                <Link href={`/recus/${receipt.id}/edit`}>
                  <Button variant="warning" size="sm" className="me-2">
                    <i className="bi bi-pencil"></i>
                  </Button>
                </Link>
                <Link href={`/recus/${receipt.id}/print`}>
                  <Button variant="success" size="sm" className="me-2">
                    <i className="bi bi-printer"></i>
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(receipt.id)}
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
export default ProtectedRoute(ReceiptsList)