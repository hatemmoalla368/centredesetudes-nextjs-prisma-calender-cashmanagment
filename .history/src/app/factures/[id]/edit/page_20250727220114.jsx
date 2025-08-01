'use client';

import { useState, useEffect } from 'react';
import InvoiceForm from '@/components/InvoiceForm'; // Assuming InvoiceForm.jsx is in components/
import { toast } from 'react-toastify';
import { notFound } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
const InvoiceEdit =({ params }) => {
const router = useRouter();
  const [initialInvoice, setInitialInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
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
        setInitialInvoice(data);
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

  if (loading) return <div>Chargement...</div>;

  return <InvoiceForm initialInvoice={initialInvoice} />;
}
export default ProtectedRoute(InvoiceEdit)