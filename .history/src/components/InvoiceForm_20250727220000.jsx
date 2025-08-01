'use client';

import { useState, useEffect } from 'react';
import { Button, Form, Row, Col, Card, Table } from 'react-bootstrap';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import printJS from 'print-js';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';

const COMPANY_INFO = {
  name: 'EduSpace Coworking',
  logo: '/logo.png',
  address: '24 Rue de l\'Éducation, Tunis 1002',
  phone: '+216 70 123 456',
  email: 'contact@eduspace.tn',
  matricule: 'MF12345678',
};

const InvoiceForm =({ initialInvoice = null }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoice, setInvoice] = useState({
    clientName: '',
    clientAddress: '',
    invoiceNumber: 'FCT-000001',
    date: new Date().toISOString().split('T')[0],
    taxRate: 19,
    timbreFiscal: 0.6,
    items: [{ description: '', quantity: 1, price: 0, discount: 0 }],
    ...COMPANY_INFO,
  });
 const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
const { isAuthenticated } = useAuth();
 useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
   
  }, [isAuthenticated, router]);

  // Fetch and set auto-incrementing invoice number
  useEffect(() => {
    const fetchLatestInvoiceNumber = async () => {
      try {
        const response = await fetch('/api/invoices?latest=true');
        const data = await response.json();
        let newNumber = 'FCT-000001';
        if (data.latestInvoice) {
          const lastNumber = parseInt(data.latestInvoice.invoiceNumber.split('-')[1], 10);
          newNumber = `FCT-${(lastNumber + 1).toString().padStart(6, '0')}`;
        }
        setInvoice((prev) => ({ ...prev, invoiceNumber: newNumber }));
      } catch (error) {
        console.error('Error fetching latest invoice number:', error);
        toast.error('Erreur lors de la génération du numéro de facture');
      }
    };

    if (!initialInvoice) {
      fetchLatestInvoiceNumber();
    }
  }, [initialInvoice]);

  // Initialize form for edit mode
  useEffect(() => {
    if (initialInvoice) {
      setInvoice({
        ...initialInvoice,
        date: new Date(initialInvoice.date).toISOString().split('T')[0],
        items: initialInvoice.items || [{ description: '', quantity: 1, price: 0, discount: 0 }],
        timbreFiscal: initialInvoice.timbreFiscal || 0.6,
        logo: initialInvoice.companyLogo || COMPANY_INFO.logo,
        name: initialInvoice.companyName || COMPANY_INFO.name,
        address: initialInvoice.companyAddress || COMPANY_INFO.address,
        phone: initialInvoice.companyPhone || COMPANY_INFO.phone,
        email: initialInvoice.companyEmail || COMPANY_INFO.email,
        matricule: initialInvoice.matriculeFiscale || COMPANY_INFO.matricule,
      });
    }
  }, [initialInvoice]);

  // Print handler
  const handlePrint = () => {
    try {
      const printContent = document.getElementById('invoice-print');
      if (!printContent) {
        console.error('Print content not found');
        toast.error('Erreur: Contenu de la facture non disponible');
        return;
      }
      console.log('Print content found:', printContent);
      printJS({
        printable: 'invoice-print',
        type: 'html',
        style: `
          @page { 
            size: A4; 
            margin: 20mm;
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
          .invoice-print { 
            padding: 20px;
            background: white !important;
            font-size: 14px;
          }
          .no-print { 
            display: none !important;
          }
          .table-dark {
            background-color: #343a40 !important;
            color: white !important;
          }
          .table-dark th {
            background-color: #343a40 !important;
            color: white !important;
            border-color: #454d55 !important;
          }
          .bg-light {
            background-color: #f8f9fa !important;
          }
          .table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          .table th, .table td {
            border: 1px solid #dee2e6 !important;
            padding: 8px !important;
          }
          .table-bordered {
            border: 1px solid #dee2e6 !important;
          }
          .text-end {
            text-align: right !important;
          }
          .table-active {
            background-color: #e9ecef !important;
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
      toast.success('Facture imprimée avec succès');
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Erreur lors de l\'impression');
    }
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (isNaN(new Date(invoice.date).getTime())) {
      toast.error('Date invalide');
      setIsSubmitting(false);
      return;
    }

    const { subtotal, taxAmount, grandTotal } = calculateTotals();

    try {
      const method = initialInvoice ? 'PUT' : 'POST';
      const url = initialInvoice ? `/api/invoices/${initialInvoice.id}` : '/api/invoices';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...invoice,
          date: new Date(invoice.date),
          items: invoice.items.map((item) => ({
            ...item,
            quantity: Number(item.quantity),
            price: Number(item.price),
            discount: Number(item.discount) || 0,
          })),
          taxRate: Number(invoice.taxRate),
          timbreFiscal: Number(invoice.timbreFiscal),
          total: subtotal,
          taxAmount,
          grandTotal,
          companyName: invoice.name,
          companyLogo: invoice.logo,
          companyAddress: invoice.address,
          companyPhone: invoice.phone,
          companyEmail: invoice.email,
          matriculeFiscale: invoice.matricule,
        }),
      });

      if (!response.ok) throw new Error('Failed to save invoice');

      const data = await response.json();
      toast.success(`Facture ${initialInvoice ? 'mise à jour' : 'créée'} avec succès!`);

      if (!initialInvoice) {
        router.push(`/factures/${data.id}`);
      } else {
        router.push('/factures');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = invoice.items.reduce(
      (sum, item) => sum + item.quantity * item.price - (item.discount || 0),
      0
    );
    const taxAmount = subtotal * (invoice.taxRate / 100);
    const grandTotal = subtotal + taxAmount + (invoice.timbreFiscal || 0);
    return { subtotal, taxAmount, grandTotal };
  };

  // Handle form field changes
  const handleChange = (e) => {
    setInvoice({ ...invoice, [e.target.name]: e.target.value });
  };

  // Handle invoice item changes
  const handleItemChange = (index, e) => {
    const newItems = [...invoice.items];
    newItems[index][e.target.name] =
      e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    setInvoice({ ...invoice, items: newItems });
  };

  // Add new item row
  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { description: '', quantity: 1, price: 0, discount: 0 }],
    });
  };

  // Remove item row
  const removeItem = (index) => {
    if (invoice.items.length <= 1) return;
    const newItems = invoice.items.filter((_, i) => i !== index);
    setInvoice({ ...invoice, items: newItems });
  };

  const { subtotal, taxAmount, grandTotal } = calculateTotals();



  
  return (
    <div className="container my-4">
      <h2>{initialInvoice ? 'Modifier Facture' : 'Nouvelle Facture'}</h2>

      <Card className="mb-4">
        <Card.Body> 
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom du Client</Form.Label>
                  <Form.Control
                    type="text"
                    name="clientName"
                    value={invoice.clientName}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Numéro de Facture</Form.Label>
                  <Form.Control
                    type="text"
                    name="invoiceNumber"
                    value={invoice.invoiceNumber}
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Adresse du Client</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="clientAddress"
                value={invoice.clientAddress}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={invoice.date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Taux de TVA (%)</Form.Label>
                  <Form.Control
                    type="number"
                    name="taxRate"
                    value={invoice.taxRate}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Timbre Fiscal (TND)</Form.Label>
                  <Form.Control
                    type="number"
                    name="timbreFiscal"
                    value={invoice.timbreFiscal}
                    onChange={(e) =>
                      setInvoice({
                        ...invoice,
                        timbreFiscal: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="0.01"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Card className="mt-4">
              <Card.Body>
                <Card.Title>Désignations</Card.Title>
                {invoice.items.map((item, index) => (
                  <Row key={index} className="mb-3 g-2 align-items-center">
                    <Col md={4}>
                      <Form.Control
                        type="text"
                        name="description"
                        placeholder="Désignation"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, e)}
                        required
                      />
                    </Col>
                    <Col md={2}>
                      <Form.Control
                        type="number"
                        name="quantity"
                        placeholder="Quantité"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, e)}
                        min="1"
                        required
                      />
                    </Col>
                    <Col md={2}>
                      <Form.Control
                        type="number"
                        name="price"
                        placeholder="Prix Unitaire"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, e)}
                        min="0"
                        step="0.01"
                        required
                      />
                    </Col>
                    <Col md={2}>
                      <Form.Control
                        type="number"
                        name="discount"
                        placeholder="Remise"
                        value={item.discount}
                        onChange={(e) => handleItemChange(index, e)}
                        min="0"
                        step="0.01"
                      />
                    </Col>
                    <Col md={1} className="text-center">
                      <span>
                        {((item.quantity * item.price) - (item.discount || 0)).toFixed(3)} TND
                      </span>
                    </Col>
                    <Col md={1}>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={invoice.items.length <= 1}
                      >
                        ×
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Button variant="primary" onClick={addItem} className="mt-2">
                  Ajouter
                </Button>
              </Card.Body>
              </Card>
            <div className="d-flex justify-content-between mt-4">
              <Button
                variant="secondary"
                onClick={() => router.push('/factures')}
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

      {/* Printable Invoice */}
      <div id="invoice-print" className="invoice-print" style={{ background: 'white' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Image
              src={invoice.logo || COMPANY_INFO.logo}
              alt="Logo"
              width={150}
              height={60}
              className="img-fluid mb-1"
            />
            <p className="mb-1"><strong>{invoice.name}</strong></p>
            <p className="mb-0 mt-2">{invoice.address}</p>
            <p className="mb-0">Tél: {invoice.phone}</p>
            <p className="mb-0">Email: {invoice.email}</p>
            <p>Matricule Fiscale: {invoice.matricule}</p>
          </div>
          <div className="text-end">
            <h2 className="mb-1">FACTURE</h2>
            <p className="mb-1"><strong>Numéro:</strong> {invoice.invoiceNumber}</p>
            <p className="mb-1"><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6">
            <div className="border p-3 bg-light">
              <h5>Client:</h5>
              <p className="mb-1"><strong>{invoice.clientName}</strong></p>
              <p className="mb-0 text-muted">{invoice.clientAddress}</p>
            </div>
          </div>
        </div>

        <Table bordered className="mb-4">
          <thead className="table-dark">
            <tr>
              <th width="50%">Désignation</th>
              <th width="15%" className="text-end">Quantité</th>
              <th width="15%" className="text-end">Prix Unitaire</th>
              <th width="15%" className="text-end">Remise</th>
              <th width="20%" className="text-end">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td>{item.description || '-'}</td>
                <td className="text-end">{item.quantity}</td>
                <td className="text-end">{item.price.toFixed(3)} TND</td>
                <td className="text-end">{(item.discount || 0).toFixed(3)} TND</td>
                <td className="text-end">{((item.quantity * item.price) - (item.discount || 0)).toFixed(3)} TND</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" className="text-end"><strong>Total HT:</strong></td>
              <td className="text-end">{subtotal.toFixed(3)} TND</td>
            </tr>
            <tr>
              <td colSpan="4" className="text-end"><strong>TVA ({invoice.taxRate}%):</strong></td>
              <td className="text-end">{taxAmount.toFixed(3)} TND</td>
            </tr>
            <tr>
              <td colSpan="4" className="text-end"><strong>Timbre Fiscal:</strong></td>
              <td className="text-end">{invoice.timbreFiscal.toFixed(3)} TND</td>
            </tr>
            <tr className="table-active">
              <td colSpan="4" className="text-end"><strong>Total TTC:</strong></td>
              <td className="text-end"><strong>{grandTotal.toFixed(3)} TND</strong></td>
            </tr>
          </tfoot>
        </Table>

        <div className="mt-5 pt-4 border-top">
          <p className="mb-1">
            Arrêtée la présente facture à la somme de:{' '}
            <strong>{numberToWords(grandTotal)} dinars</strong>
          </p>
          <div className="d-flex justify-content-between mt-5">
            <div>
              <p className="mb-0">Signature client</p>
              <p className="border-top pt-4" style={{ width: '200px' }}></p>
            </div>
            <div className="text-end">
              <p className="mb-0">Pour {invoice.name}</p>
              <p className="border-top pt-4" style={{ width: '200px' }}></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProtectedRoute(InvoiceForm)
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