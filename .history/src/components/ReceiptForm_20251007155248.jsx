'use client';

import { useState, useEffect } from 'react';
import { Button, Form, Row, Col, Card } from 'react-bootstrap';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import printJS from 'print-js';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
 
const COMPANY_INFO = {
  name: 'Espace Horizons du progrès',
  logo: '/logo.png',
  address: 'Route Manzel Chaker klm 5.5, Markez moalla, Sfax',
  phone: '+216 24 021 594',
  email: 'afaktakadom@gmail.com',
  
};

const ReceiptForm =({ initialReceipt = null })=> {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState({
    payerName: '',
    payerAddress: '',
    receiptNumber: 'RCP-000001',
    paymentDate: new Date().toISOString().split('T')[0],
    amount: 0,
    amountInWords: '',
    paymentDescription: '',
    paymentMethod: {
      type: 'Espèces',
      chequeNumber: '',
      bank: '',
      transactionNumber: '',
      otherDetails: '',
    },
    place: 'Sfax',
    ...COMPANY_INFO,
  });
const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch and set auto-incrementing receipt number
  useEffect(() => {
    const fetchLatestReceiptNumber = async () => {
      try {
        const response = await fetch('/api/receipts?latest=true');
        const data = await response.json();
        let newNumber = 'RCP-000001';
        if (data.latestReceipt) {
          const lastNumber = parseInt(data.latestReceipt.receiptNumber.split('-')[1], 10);
          newNumber = `RCP-${(lastNumber + 1).toString().padStart(6, '0')}`;
        }
        setReceipt((prev) => ({ ...prev, receiptNumber: newNumber }));
      } catch (error) {
        console.error('Error fetching latest receipt number:', error);
        toast.error('Erreur lors de la génération du numéro de reçu');
      }
    };

    if (!initialReceipt) {
      fetchLatestReceiptNumber();
    }
  }, [initialReceipt]);

  // Initialize form for edit mode
  useEffect(() => {
    if (initialReceipt) {
      setReceipt({
        ...initialReceipt,
        paymentDate: new Date(initialReceipt.paymentDate).toISOString().split('T')[0],
        paymentMethod: {
          type: initialReceipt.paymentMethod?.type || 'Espèces',
          chequeNumber: initialReceipt.paymentMethod?.chequeNumber || '',
          bank: initialReceipt.paymentMethod?.bank || '',
          transactionNumber: initialReceipt.paymentMethod?.transactionNumber || '',
          otherDetails: initialReceipt.paymentMethod?.otherDetails || '',
        },
        logo: initialReceipt.companyLogo || COMPANY_INFO.logo,
        name: initialReceipt.companyName || COMPANY_INFO.name,
        address: initialReceipt.companyAddress || COMPANY_INFO.address,
        phone: initialReceipt.companyPhone || COMPANY_INFO.phone,
        email: initialReceipt.companyEmail || COMPANY_INFO.email,
        
        place: initialReceipt.place || 'Tunis',
      });
    }
  }, [initialReceipt]);

  // Update amountInWords when amount changes
  useEffect(() => {
    setReceipt((prev) => ({
      ...prev,
      amountInWords: numberToWords(prev.amount),
    }));
  }, [receipt.amount]);

  // Print handler
  const handlePrint = () => {
    try {
      const printContent = document.getElementById('receipt-print');
      if (!printContent) {
        console.error('Print content not found');
        toast.error('Erreur: Contenu du reçu non disponible');
        return;
      }
      console.log('Print content found:', printContent);
      printJS({
        printable: 'receipt-print',
        type: 'html',
        style: `
          @page { 
            size: A4; 
            margin: 10mm;
            @top-left { content: none !important; }
            @top-right { content: none !important; }
            @bottom-left { content: none !important; }
            @bottom-right { content: none !important; }
          }
          body { 
            -webkit-print-color-adjust: exact;
            background: white !important;
            font-family: Arial, sans-serif;
          }
          .receipt-print { 
            padding: 20px;
            background: white !important;
            font-size: 14px;
          }
          .no-print { 
            display: none !important;
          }
          .bg-light {
            background-color: #f8f9fa !important;
          }
          .text-end {
            text-align: right !important;
          }
          .d-flex {
            display: flex !important;
          }
          .justify-content-between {
            justify-content: space-between !important;
          }
          .align-items-center {
            align-items: center !important;
          }
          .mb-0 {
            margin-bottom: 0 !important;
          }
          .mb-1 {
            margin-bottom: 0.25rem !important;
          }
          .mb-4 {
            margin-bottom: 1.5rem !important;
          }
          .mt-2 {
            margin-top: 0.5rem !important;
          }
          .mt-5 {
            margin-top: 3rem !important;
          }
          .pt-4 {
            padding-top: 1.5rem !important;
          }
          .border-top {
            border-top: 1px solid #dee2e6 !important;
          }
          h2 {
            font-size: 1.5rem !important;
          }
          h5 {
            font-size: 1.25rem !important;
          }
          .img-fluid {
            max-width: 100% !important;
            height: auto !important;
          }
          .col-md-6 {
            width: 50% !important;
          }
          .row {
            display: flex !important;
            flex-wrap: wrap !important;
          }
          .text-muted {
            color: #6c757d !important;
          }
        `,
        onError: (error) => {
          console.error('Print error:', error);
          toast.error('Erreur lors de l\'impression');
        },
      });
      toast.success('Reçu imprimé avec succès');
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Erreur lors de l\'impression');
    }
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (isNaN(new Date(receipt.paymentDate).getTime())) {
      toast.error('Date invalide');
      setIsSubmitting(false);
      return;
    }

    try {
      const method = initialReceipt ? 'PUT' : 'POST';
      const url = initialReceipt ? `/api/receipts/${initialReceipt.id}` : '/api/receipts';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...receipt,
          paymentDate: new Date(receipt.paymentDate),
          amount: Number(receipt.amount),
          paymentMethod: {
            type: receipt.paymentMethod.type,
            chequeNumber: receipt.paymentMethod.type === 'Chèque' ? receipt.paymentMethod.chequeNumber : '',
            bank: receipt.paymentMethod.type === 'Chèque' ? receipt.paymentMethod.bank : '',
            transactionNumber: receipt.paymentMethod.type === 'Virement Bancaire' ? receipt.paymentMethod.transactionNumber : '',
            otherDetails: receipt.paymentMethod.type === 'Autre' ? receipt.paymentMethod.otherDetails : '',
          },
          companyName: receipt.name,
          companyLogo: receipt.logo,
          companyAddress: receipt.address,
          companyPhone: receipt.phone,
          companyEmail: receipt.email,
          
        }),
      });

      if (!response.ok) throw new Error('Failed to save receipt');

      const data = await response.json();
      toast.success(`Reçu ${initialReceipt ? 'mis à jour' : 'créé'} avec succès!`);

      if (!initialReceipt) {
        router.push(`/recus/${data.id}`);
      } else {
        router.push('/recus');
      }
    } catch (error) {
      console.error('Error saving receipt:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    setReceipt({ ...receipt, [e.target.name]: e.target.value });
  };

  // Handle payment method changes
  const handlePaymentMethodChange = (e) => {
    const { name, value } = e.target;
    setReceipt({
      ...receipt,
      paymentMethod: { ...receipt.paymentMethod, [name]: value },
    });
  };


  
  return (
    <div className="container my-4">
      <h2>{initialReceipt ? 'Modifier Reçu' : 'Nouveau Reçu'}</h2>

      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom du Payeur</Form.Label>
                  <Form.Control
                    type="text"
                    name="payerName"
                    value={receipt.payerName}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Numéro de Reçu</Form.Label>
                  <Form.Control
                    type="text"
                    name="receiptNumber"
                    value={receipt.receiptNumber}
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Adresse du Payeur</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="payerAddress"
                value={receipt.payerAddress}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date du Paiement</Form.Label>
                  <Form.Control
                    type="date"
                    name="paymentDate"
                    value={receipt.paymentDate}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Montant (TND)</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={receipt.amount}
                    onChange={(e) =>
                      setReceipt({
                        ...receipt,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="0.001"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Objet du Paiement</Form.Label>
              <Form.Control
                type="text"
                name="paymentDescription"
                value={receipt.paymentDescription}
                onChange={handleChange}
                placeholder="Ex: Facture N°..., Acompte sur..."
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Moyen de Paiement</Form.Label>
              <Form.Select
                name="type"
                value={receipt.paymentMethod.type}
                onChange={handlePaymentMethodChange}
                className="mb-3"
              >
                <option value="Espèces">Espèces</option>
                <option value="Chèque">Chèque</option>
                <option value="Virement Bancaire">Virement Bancaire</option>
                <option value="Autre">Autre</option>
              </Form.Select>

              {receipt.paymentMethod.type === 'Chèque' && (
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Numéro de Chèque</Form.Label>
                      <Form.Control
                        type="text"
                        name="chequeNumber"
                        value={receipt.paymentMethod.chequeNumber}
                        onChange={handlePaymentMethodChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Banque</Form.Label>
                      <Form.Control
                        type="text"
                        name="bank"
                        value={receipt.paymentMethod.bank}
                        onChange={handlePaymentMethodChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {receipt.paymentMethod.type === 'Virement Bancaire' && (
                <Form.Group className="mb-3">
                  <Form.Label>Numéro de Transaction</Form.Label>
                  <Form.Control
                    type="text"
                    name="transactionNumber"
                    value={receipt.paymentMethod.transactionNumber}
                    onChange={handlePaymentMethodChange}
                    required
                  />
                </Form.Group>
              )}

              {receipt.paymentMethod.type === 'Autre' && (
                <Form.Group className="mb-3">
                  <Form.Label>Détails</Form.Label>
                  <Form.Control
                    type="text"
                    name="otherDetails"
                    value={receipt.paymentMethod.otherDetails}
                    onChange={handlePaymentMethodChange}
                    required
                  />
                </Form.Group>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Lieu</Form.Label>
              <Form.Control
                type="text"
                name="place"
                value={receipt.place}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-between mt-4">
              <Button
                variant="secondary"
                onClick={() => router.push('/recus')}
                disabled={isSubmitting}
                className="no-print"
              >
                Annuler
              </Button>
              <div>
                <Button
                  variant="success"
                  onClick={handlePrint}
                  className="me-2 no-print"
                  disabled={isSubmitting}
                >
                  Imprimer
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                  className="no-print"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Printable Receipt */}
      <div id="receipt-print" className="receipt-print" style={{ background: 'white' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Image
              src={receipt.logo || COMPANY_INFO.logo}
              alt="Logo"
              width={150}
              height={60}
              className="img-fluid"
            />
            <p className="mb-0 mt-2">{receipt.address}</p>
            <p className="mb-0">Tél: {receipt.phone}</p>
            <p className="mb-0">Email: {receipt.email}</p>
            
          </div>
          <div className="text-end">
            <h2 className="mb-1">REÇU DE PAIEMENT</h2>
            <p className="mb-1"><strong>Numéro:</strong> {receipt.receiptNumber}</p>
            <p className="mb-1"><strong>Date du Paiement:</strong> {new Date(receipt.paymentDate).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6">
            <div className="border p-3 bg-light">
              <h5>Émetteur:</h5>
              <p className="mb-1"><strong>{receipt.name}</strong></p>
              <p className="mb-0 text-muted">{receipt.address}</p>
              <p className="mb-0">Tél: {receipt.phone}</p>
              
            </div>
          </div>
          <div className="col-md-6">
            <div className="border p-3 bg-light">
              <h5>Payeur:</h5>
              <p className="mb-1"><strong>{receipt.payerName}</strong></p>
              <p className="mb-0 text-muted">{receipt.payerAddress}</p>
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
}
export default ProtectedRoute(ReceiptForm)
// French number to words conversion
function numberToWords(num) {
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

  num = parseFloat(num).toFixed(3);
  const parts = num.split('.');
  let whole = parseInt(parts[0], 10);
  const decimal = parts[1];

  if (whole === 0) return 'zéro';

  let words = [];

  if (whole >= 1000) {
    const thousands = Math.floor(whole / 1000);
    words.push(thousands === 1 ? 'mille' : `${numberToWords(thousands)} mille`);
    whole = whole % 1000;
  }

  if (whole >= 100) {
    const hundreds = Math.floor(whole / 100);
    words.push(hundreds === 1 ? 'cent' : `${units[hundreds]} cent`);
    whole = whole % 100;
  }

  if (whole > 0) {
    if (whole < 10) {
      words.push(units[whole]);
    } else if (whole < 20) {
      words.push(teens[whole - 10]);
    } else {
      const ten = Math.floor(whole / 10);
      const unit = whole % 10;

      if (ten === 7 || ten === 9) {
        words.push(tens[ten - 1]);
        if (unit === 1 && ten === 7) {
          words.push('et');
        }
        words.push(teens[unit]);
      } else {
        words.push(tens[ten]);
        if (unit === 1 && ten !== 8) {
          words.push('et');
        }
        if (unit > 0) {
          words.push(units[unit]);
        }
      }
    }
  }

  let result = words.join(' ').replace(/  +/g, ' ');
  if (decimal && decimal !== '000') {
    const decimalNum = parseInt(decimal, 10);
    result += ` et ${numberToWords(decimalNum)} millimes`;
  }

  return result;
}