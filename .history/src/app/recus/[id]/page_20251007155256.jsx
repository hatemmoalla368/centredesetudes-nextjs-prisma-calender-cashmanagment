'use client';

import { useState, useEffect } from 'react';
import { Button, Container, Card, Row, Col } from 'react-bootstrap';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { notFound } from 'next/navigation';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
const COMPANY_INFO = {
  name: 'Espace Horizons du progrès',
  logo: '/logo.png',
  address: 'Route Manzel Chaker klm 5.5, Markez moalla, Sfax',
  phone: '+216 24 021 594',
  email: 'afaktakadom@gmail.com',
};

const ReceiptView = ({ params })=> {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
 const router = useRouter();

  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await fetch(`/api/receipts/${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch receipt');
        const data = await res.json();
        setReceipt(data);
      } catch (error) {
        console.error('Error fetching receipt:', error);
        toast.error('Erreur lors du chargement du reçu');
        notFound();
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce reçu ?')) return;
    try {
      const res = await fetch(`/api/receipts/${params.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete receipt');
      toast.success('Reçu supprimé avec succès');
      window.location.href = '/recus';
    } catch (error) {
      console.error('Error deleting receipt:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading || !receipt) {
    return (
      <Container className="my-4">
        <div>Chargement...</div>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Reçu #{receipt.receiptNumber}</h2>
        <div>
          <Link href={`/recus/${receipt.id}/edit`}>
            <Button variant="warning" className="me-2">
              <i className="bi bi-pencil me-1"></i> Modifier
            </Button>
          </Link>
          <Link href={`/recus/${receipt.id}/print`}>
            <Button variant="success" className="me-2">
              <i className="bi bi-printer me-1"></i> Imprimer
            </Button>
          </Link>
          <Button variant="danger" onClick={handleDelete}>
            <i className="bi bi-trash me-1"></i> Supprimer
          </Button>
        </div>
      </div>

      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <Image
                src={receipt.companyLogo || COMPANY_INFO.logo}
                alt="Logo"
                width={150}
                height={60}
                className="img-fluid"
              />
              <p className="mb-0 mt-2">{receipt.companyAddress}</p>
              <p className="mb-0">Tél: {receipt.companyPhone}</p>
              <p className="mb-0">Email: {receipt.companyEmail}</p>
              
            </div>
            <div className="text-end">
              <h2 className="mb-1">REÇU DE PAIEMENT</h2>
              <p className="mb-1"><strong>Numéro:</strong> {receipt.receiptNumber}</p>
              <p className="mb-1"><strong>Date du Paiement:</strong> {new Date(receipt.paymentDate).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <Row className="mb-4">
            <Col md={6}>
              <div className="border p-3 bg-light">
                <h5>Émetteur:</h5>
                <p className="mb-1"><strong>{receipt.companyName}</strong></p>
                <p className="mb-0 text-muted">{receipt.companyAddress}</p>
                <p className="mb-0">Tél: {receipt.companyPhone}</p>
                
              </div>
            </Col>
            <Col md={6}>
              <div className="border p-3 bg-light">
                <h5>Payeur:</h5>
                <p className="mb-1"><strong>{receipt.payerName}</strong></p>
                <p className="mb-0 text-muted">{receipt.payerAddress}</p>
              </div>
            </Col>
          </Row>

          <div className="border p-3 mb-4 bg-light">
            <h5>Montant:</h5>
            <p className="mb-1"><strong>{receipt.amount.toFixed(3)} TND</strong></p>
            <p className="mb-0">({receipt.amountInWords} dinars)</p>
          </div>

          <div className="border p-3 mb-4 bg-light">
            <h5>Description du Paiement:</h5>
            <p className="mb-0">{receipt.paymentDescription}</p>
          </div>

          <div className="border p-3 mb-4 bg-light">
            <h5>Moyen de Paiement:</h5>
            <p className="mb-1"><strong>{receipt.paymentMethod.type}</strong></p>
            {receipt.paymentMethod.type === 'Chèque' && (
              <>
                <p className="mb-0">Numéro de Chèque: {receipt.paymentMethod.chequeNumber}</p>
                <p className="mb-0">Banque: {receipt.paymentMethod.bank}</p>
              </>
            )}
            {receipt.paymentMethod.type === 'Virement Bancaire' && (
              <p className="mb-0">Numéro de Transaction: {receipt.paymentMethod.transactionNumber}</p>
            )}
            {receipt.paymentMethod.type === 'Autre' && (
              <p className="mb-0">Détails: {receipt.paymentMethod.otherDetails}</p>
            )}
          </div>

          <div className="mt-5 pt-4 border-top">
            <div className="d-flex justify-content-between">
              <div>
                
                <p className="border-top pt-4" style={{ width: '200px' }}></p>
              </div>
              <div className="text-end">
                <p className="mb-0">Lieu: {receipt.place}</p>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
export default ProtectedRoute(ReceiptView)