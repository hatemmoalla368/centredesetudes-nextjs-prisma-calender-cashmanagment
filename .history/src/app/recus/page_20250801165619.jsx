'use client';

import { useState, useEffect } from 'react';
import { Button as BootstrapButton, Container, Table, Form, Modal, FormCheck, Spinner } from 'react-bootstrap';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Button from '@mui/material/Button';
import InputIcon from '@mui/icons-material/Input';

const ReceiptsList = () => {
  const router = useRouter();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [nonReceiptedTransactions, setNonReceiptedTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [payerName, setPayerName] = useState('');
  const [payerAddress, setPayerAddress] = useState('');
  const [amountInWords, setAmountInWords] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState({ type: 'Espèces' });
  const [place, setPlace] = useState('Tunis');
  const [receiptNumber, setReceiptNumber] = useState('RCT-000001');

  useEffect(() => {
    if (!isAuthenticated && !isAuthLoading) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Generate receipt number
  const generateReceiptNumber = async () => {
    try {
      const response = await fetch('/api/receipts?latest=true');
      if (!response.ok) throw new Error('Échec de la récupération du dernier numéro de reçu');
      const data = await response.json();
      let newNumber = 'RCT-000001';
      if (data.latestReceipt && data.latestReceipt.receiptNumber) {
        const lastNumber = parseInt(data.latestReceipt.receiptNumber.split('-')[1], 10);
        if (!isNaN(lastNumber)) {
          newNumber = `RCT-${(lastNumber + 1).toString().padStart(6, '0')}`;
        }
      }
      console.log('Generated receipt number:', newNumber);
      setReceiptNumber(newNumber);
    } catch (error) {
      console.error('Erreur lors de la génération du numéro de reçu:', error);
      toast.error('Erreur lors de la génération du numéro de reçu');
      setReceiptNumber('RCT-000001');
    }
  };

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/receipts?t=' + Date.now());
        if (!res.ok) throw new Error('Échec de la récupération des reçus');
        const data = await res.json();
        setReceipts(data);
        setFilteredReceipts(data);
      } catch (error) {
        console.error('Erreur lors du chargement des reçus:', error);
        toast.error('Erreur lors du chargement des reçus');
        setError('Erreur lors du chargement des reçus');
      } finally {
        setLoading(false);
      }
    };
    fetchReceipts();
    generateReceiptNumber();
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

  const fetchNonReceiptedTransactions = async () => {
    try {
      const res = await fetch('/api/transactions?noReceipt=true&t=' + Date.now());
      if (!res.ok) throw new Error('Échec de la récupération des transactions sans reçu');
      const data = await res.json();
      console.log('Non-receipted transactions:', data);
      setNonReceiptedTransactions(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions sans reçu:', error);
      toast.error('Erreur lors de la récupération des transactions sans reçu');
    }
  };

  const handleOpenImportModal = () => {
    setShowImportModal(true);
    setPayerName('');
    setPayerAddress('');
    setAmountInWords('');
    setPaymentDescription('');
    setPaymentMethod({ type: 'Espèces' });
    setPlace('Tunis');
    setSelectedTransaction(null);
    fetchNonReceiptedTransactions();
    generateReceiptNumber();
  };

  const handleTransactionSelect = (transaction) => {
    setSelectedTransaction(transaction);
    setPayerName(transaction.student?.name || transaction.teacher?.name || '');
    setPayerAddress('');
    setAmountInWords('');
    setPaymentDescription(transaction.description || '');
    setPaymentMethod({ type: 'Espèces' });
    setPlace('Tunis');
  };

  const handleGenerateReceipt = async () => {
    if (!selectedTransaction) {
      toast.error('Veuillez sélectionner une transaction');
      return;
    }
    if (!payerName) {
      toast.error('Veuillez entrer le nom du payeur');
      return;
    }
    if (!payerAddress) {
      toast.error('Veuillez entrer l’adresse du payeur');
      return;
    }
    if (!amountInWords) {
      toast.error('Veuillez entrer le montant en mots');
      return;
    }
    if (!paymentDescription) {
      toast.error('Veuillez entrer la description du paiement');
      return;
    }
    if (!paymentMethod.type) {
      toast.error('Veuillez sélectionner un mode de paiement');
      return;
    }
    if (!place) {
      toast.error('Veuillez entrer le lieu');
      return;
    }
    if (!receiptNumber.match(/^RCT-\d{6}$/)) {
      toast.error('Numéro de reçu invalide');
      return;
    }

    try {
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptNumber,
          payerName,
          payerAddress,
          paymentDate: selectedTransaction.date,
          amount: parseFloat(selectedTransaction.amount),
          amountInWords,
          paymentDescription,
          paymentMethod,
          place,
          transactionId: selectedTransaction.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la création du reçu');
      }

      // Refresh receipts
      const res = await fetch('/api/receipts?t=' + Date.now());
      if (!res.ok) throw new Error('Échec de la récupération des reçus');
      const data = await res.json();
      setReceipts(data);
      setFilteredReceipts(data);
      setShowImportModal(false);
      setSelectedTransaction(null);
      setPayerName('');
      setPayerAddress('');
      setAmountInWords('');
      setPaymentDescription('');
      setPaymentMethod({ type: 'Espèces' });
      setPlace('Tunis');
      generateReceiptNumber();
      toast.success('Reçu créé avec succès');
    } catch (error) {
      console.error('Erreur lors de la création du reçu:', error);
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce reçu ?')) return;
    try {
      const res = await fetch(`/api/receipts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Échec de la suppression du reçu');
      setReceipts(receipts.filter((receipt) => receipt.id !== id));
      setFilteredReceipts(filteredReceipts.filter((receipt) => receipt.id !== id));
      toast.success('Reçu supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du reçu:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  if (isAuthLoading || loading) {
    return (
      <Container className="my-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Liste des Reçus</h2>
        <div className="d-flex gap-2">
          <Link href="/recus/new">
            <Button variant="contained" color="primary">
              <i className="bi bi-plus-circle me-2"></i> Nouveau Reçu
            </Button>
          </Link>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<InputIcon />}
            onClick={handleOpenImportModal}
            className="bg-green-600 hover:bg-green-700"
          >
            Importer Reçu
          </Button>
        </div>
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

      {error && <div className="alert alert-danger">{error}</div>}

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
                  <BootstrapButton variant="info" size="sm" className="me-2">
                    <i className="bi bi-eye"></i>
                  </BootstrapButton>
                </Link>
                <Link href={`/recus/${receipt.id}/edit`}>
                  <BootstrapButton variant="warning" size="sm" className="me-2">
                    <i className="bi bi-pencil"></i>
                  </BootstrapButton>
                </Link>
                <Link href={`/recus/${receipt.id}/print`}>
                  <BootstrapButton variant="success" size="sm" className="me-2">
                    <i className="bi bi-printer"></i>
                  </BootstrapButton>
                </Link>
                <BootstrapButton
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(receipt.id)}
                >
                  <i className="bi bi-trash"></i>
                </BootstrapButton>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showImportModal} onHide={() => setShowImportModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Importer Reçu - Sélectionner une Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Numéro de Reçu</Form.Label>
            <Form.Control
              type="text"
              value={receiptNumber}
              readOnly
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nom du Payeur</Form.Label>
            <Form.Control
              type="text"
              placeholder="Entrer le nom du payeur"
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Adresse du Payeur</Form.Label>
            <Form.Control
              type="text"
              placeholder="Entrer l’adresse du payeur"
              value={payerAddress}
              onChange={(e) => setPayerAddress(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Montant en Mots</Form.Label>
            <Form.Control
              type="text"
              placeholder="Entrer le montant en mots"
              value={amountInWords}
              onChange={(e) => setAmountInWords(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description du Paiement</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Entrer la description du paiement"
              value={paymentDescription}
              onChange={(e) => setPaymentDescription(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mode de Paiement</Form.Label>
            <Form.Select
              value={paymentMethod.type}
              onChange={(e) => setPaymentMethod({ type: e.target.value })}
              required
            >
              <option value="Espèces">Espèces</option>
              <option value="Chèque">Chèque</option>
              <option value="Virement Bancaire">Virement Bancaire</option>
              <option value="Autre">Autre</option>
            </Form.Select>
          </Form.Group>
          {paymentMethod.type === 'Chèque' && (
            <Form.Group className="mb-3">
              <Form.Label>Numéro de Chèque</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrer le numéro de chèque"
                value={paymentMethod.chequeNumber || ''}
                onChange={(e) => setPaymentMethod({ ...paymentMethod, chequeNumber: e.target.value })}
              />
            </Form.Group>
          )}
          {paymentMethod.type === 'Virement Bancaire' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Banque</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Entrer le nom de la banque"
                  value={paymentMethod.bank || ''}
                  onChange={(e) => setPaymentMethod({ ...paymentMethod, bank: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Numéro de Transaction</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Entrer le numéro de transaction"
                  value={paymentMethod.transactionNumber || ''}
                  onChange={(e) => setPaymentMethod({ ...paymentMethod, transactionNumber: e.target.value })}
                />
              </Form.Group>
            </>
          )}
          {paymentMethod.type === 'Autre' && (
            <Form.Group className="mb-3">
              <Form.Label>Détails</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrer les détails du paiement"
                value={paymentMethod.otherDetails || ''}
                onChange={(e) => setPaymentMethod({ ...paymentMethod, otherDetails: e.target.value })}
              />
            </Form.Group>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Lieu</Form.Label>
            <Form.Control
              type="text"
              placeholder="Entrer le lieu"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              required
            />
          </Form.Group>
          <h5 className="mb-3">Transactions sans reçu</h5>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Sélectionner</th>
                <th>Date</th>
                <th>Montant (TND)</th>
                <th>Description</th>
                <th>Catégorie</th>
                <th>Enseignant</th>
                <th>Étudiant</th>
              </tr>
            </thead>
            <tbody>
              {nonReceiptedTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    <FormCheck
                      type="radio"
                      name="transactionSelect"
                      checked={selectedTransaction?.id === transaction.id}
                      onChange={() => handleTransactionSelect(transaction)}
                    />
                  </td>
                  <td>{new Date(transaction.date).toLocaleDateString('fr-FR')}</td>
                  <td>{parseFloat(transaction.amount).toFixed(3)}</td>
                  <td>{transaction.description || 'Aucune description'}</td>
                  <td>
                    {transaction.category === 'salary' ? 'Salaire' :
                     transaction.category === 'taxes' ? 'Taxes' :
                     transaction.category === 'classroom_rent' ? 'Location salle' :
                     transaction.category === 'student_payment' ? 'Paiement étudiant' :
                     transaction.category === 'teacher_share' ? 'Part enseignant' :
                     transaction.category}
                  </td>
                  <td>{transaction.teacher?.name || '-'}</td>
                  <td>{transaction.student?.name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <BootstrapButton
            variant="secondary"
            onClick={() => setShowImportModal(false)}
          >
            Annuler
          </BootstrapButton>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateReceipt}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Générer Reçu
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProtectedRoute(ReceiptsList);