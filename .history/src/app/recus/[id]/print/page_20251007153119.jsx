'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button, Container } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { notFound } from 'next/navigation';
import printJS from 'print-js';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
const ReceiptPrint = ({ params }) => {
 const router = useRouter();
 const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading || !receipt) {
    return (
      <Container className="my-4">
        <div>Chargement...</div>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-4 no-print">
        <h2>Reçu #{receipt.receiptNumber}</h2>
        <Button variant="success" onClick={handlePrint} disabled={loading}>
          <i className="bi bi-printer me-2"></i> Imprimer
        </Button>
      </div>

      <div id="receipt-print" className="receipt-print" style={{ background: 'white' }}>
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

        <div className="row mb-4">
          <div className="col-md-6">
            <div className="border p-3 bg-light">
              <h5>Émetteur:</h5>
              <p className="mb-1"><strong>{receipt.companyName}</strong></p>
              <p className="mb-0 text-muted">{receipt.companyAddress}</p>
              <p className="mb-0">Tél: {receipt.companyPhone}</p>
              <p className="mb-5">Matricule Fiscale: {receipt.matriculeFiscale}</p>
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
              <p className="mb-0">Signature de l'Émetteur</p>
              <p className="border-top pt-4" style={{ width: '200px' }}></p>
            </div>
            <div className="text-end">
              <p className="mb-0">Lieu: {receipt.place}</p>
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
export default ProtectedRoute(ReceiptPrint)