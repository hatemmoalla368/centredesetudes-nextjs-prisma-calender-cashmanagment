'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button, Container, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { notFound } from 'next/navigation';
import printJS from 'print-js';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
const COMPANY_INFO = {
  name: 'EduSpace Coworking',
  logo: '/logo.png',
  address: '24 Rue de l\'Éducation, Tunis 1002',
  phone: '+216 70 123 456',
  email: 'contact@eduspace.tn',
  matricule: 'MF12345678',
};

const InvoicePrint = ({ params })=> {
  const [invoice, setInvoice] = useState(null);
const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoices/${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch invoice');
        const data = await res.json();
        setInvoice(data);
      } catch (error) {
        console.error('Error fetching invoice:', error);
        toast.error('Erreur lors du chargement de la facture');
        notFound();
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [params.id]);

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

  if (loading || !invoice) {
    return (
      <Container className="my-4">
        <div>Chargement...</div>
      </Container>
    );
  }

  const subtotal = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.price - (item.discount || 0),
    0
  );
  const taxAmount = subtotal * (invoice.taxRate / 100);
  const grandTotal = subtotal + taxAmount + (invoice.timbreFiscal || 0);

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-4 no-print">
        <h2>Facture #{invoice.invoiceNumber}</h2>
        <Button variant="success" onClick={handlePrint} disabled={loading}>
          <i className="bi bi-printer me-2"></i> Imprimer
        </Button>
      </div>

      <div id="invoice-print" className="invoice-print" style={{ background: 'white' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Image
              src={invoice.companyLogo || COMPANY_INFO.logo}
              alt="Logo"
              width={150}
              height={60}
              className="img-fluid mb-1"
            />
            <p className="mb-1"><strong>{invoice.companyName}</strong></p>
            <p className="mb-0 mt-2">{invoice.companyAddress}</p>
            <p className="mb-0">Tél: {invoice.companyPhone}</p>
            <p className="mb-0">Email: {invoice.companyEmail}</p>
            <p>Matricule Fiscale: {invoice.matriculeFiscale}</p>
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
              <p className="mb-0">Pour {invoice.companyName}</p>
              <p className="border-top pt-4" style={{ width: '200px' }}></p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

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
export default ProtectedRoute(InvoicePrint)