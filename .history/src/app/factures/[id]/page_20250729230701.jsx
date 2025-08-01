'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Table, Button } from 'react-bootstrap';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const InvoiceView =({ params }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
const { isAuthenticated } = useAuth();
 useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);
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

  if (loading || !invoice) return <div>Chargement...</div>;
console.log('invoice data', invoice)
  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Facture #{invoice.invoiceNumber}</h2>
        <div>
          <Link href={`/factures/${invoice.id}/edit`} className="me-2">
            <Button variant="primary">
              <i className="bi bi-pencil me-2"></i> Modifier
            </Button>
          </Link>
          <Button
            variant="success"
            onClick={() => window.open(`/factures/${invoice.id}/print`, '_blank')}
          >
            <i className="bi bi-printer me-2"></i> Imprimer
          </Button>
        </div>
      </div>

      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <Image
                src={invoice.companyLogo}
                alt="Logo"
                width={150}
                height={60}
                className="img-fluid"
              />
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
                <td className="text-end">{typeof item.price === 'number' ? item.price.toFixed(3) : '0.000'} TND</td>
<td className="text-end">{typeof item.discount === 'number' ? item.discount.toFixed(3) : '0.000'} TND</td>
<td className="text-end">
  {typeof item.price === 'number' && typeof item.quantity === 'number'
    ? ((item.quantity * item.price - (item.discount || 0)).toFixed(3))
    : '0.000'} TND
</td>

                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="text-end"><strong>Total HT:</strong></td>
<td className="text-end">{typeof invoice.total === 'number' ? invoice.total.toFixed(3) : '0.000'} TND</td>
              </tr>
              <tr>
                <td colSpan="4" className="text-end"><strong>TVA ({invoice.taxRate}%):</strong></td>
<td className="text-end">{typeof invoice.taxAmount === 'number' ? invoice.taxAmount.toFixed(3) : '0.000'} TND</td>
              </tr>
              <tr>
                <td colSpan="4" className="text-end"><strong>Timbre Fiscal:</strong></td>
<td className="text-end">{typeof invoice.timbreFiscal === 'number' ? invoice.timbreFiscal.toFixed(3) : '0.000'} TND</td>
              </tr>
              <tr className="table-active">
                <td colSpan="4" className="text-end"><strong>Total TTC:</strong></td>
<td className="text-end"><strong>{typeof invoice.grandTotal === 'number' ? invoice.grandTotal.toFixed(3) : '0.000'} TND</strong></td>
              </tr>
            </tfoot>
          </Table>

          <div className="mt-5 pt-4 border-top">
            <p className="mb-1">
              Arrêtée la présente facture à la somme de:{' '}
              <strong>{numberToWords(invoice.grandTotal)} dinars</strong>
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
        </Card.Body>
      </Card>
    </div>
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
export default ProtectedRoute(InvoiceView)