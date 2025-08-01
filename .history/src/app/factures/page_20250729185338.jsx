'use client';

import { useState, useEffect } from 'react';
import { Button as BootstrapButton, Container, Table, Form, Modal, FormCheck, Spinner } from 'react-bootstrap';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import InputIcon from '@mui/icons-material/Input';
import ProtectedRoute from '@/components/ProtectedRoute';

const InvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [nonInvoicedSchedules, setNonInvoicedSchedules] = useState([]);
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch('/api/invoices');
        if (!res.ok) throw new Error('Échec de la récupération des factures');
        const data = await res.json();
        setInvoices(data);
        setFilteredInvoices(data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des factures:', error);
        toast.error('Erreur lors de la récupération des factures');
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  useEffect(() => {
    const filtered = invoices.filter(
      (invoice) =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInvoices(filtered);
  }, [searchTerm, invoices]);

  const fetchNonInvoicedSchedules = async () => {
    try {
      const res = await fetch('/api/schedules/non-invoiced');
      if (!res.ok) throw new Error('Échec de la récupération des horaires non facturés');
      const data = await res.json();
      setNonInvoicedSchedules(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des horaires non facturés:', error);
      toast.error('Erreur lors de la récupération des horaires non facturés');
    }
  };

  const handleOpenImportModal = () => {
    setShowImportModal(true);
    fetchNonInvoicedSchedules();
  };

  const handleScheduleSelect = (scheduleId) => {
    setSelectedSchedules((prev) =>
      prev.includes(scheduleId)
        ? prev.filter((id) => id !== scheduleId)
        : [...prev, scheduleId]
    );
  };

  const handleGenerateInvoice = async () => {
    if (!clientName) {
      toast.error('Veuillez entrer le nom du client');
      return;
    }
    if (selectedSchedules.length === 0) {
      toast.error('Veuillez sélectionner au moins un horaire');
      return;
    }

    try {
      const invoiceNumber = `INV-${Date.now()}`;
      const grandTotal = selectedSchedules.length * 100; // Example: 100 TND per schedule
      const date = new Date().toISOString();

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber,
          clientName,
          date,
          grandTotal,
          scheduleIds: selectedSchedules,
        }),
      });

      if (!response.ok) throw new Error('Échec de la création de la facture');

      // Update schedules to mark as invoiced
      await Promise.all(
        selectedSchedules.map((scheduleId) =>
          fetch(`/api/schedules/${scheduleId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invoiced: true }),
          })
        )
      );

      // Refresh invoices
      const res = await fetch('/api/invoices');
      if (!res.ok) throw new Error('Échec de la récupération des factures');
      const data = await res.json();
      setInvoices(data);
      setFilteredInvoices(data);
      setShowImportModal(false);
      setSelectedSchedules([]);
      setClientName('');
      toast.success('Facture créée avec succès');
    } catch (error) {
      console.error('Erreur lors de la création de la facture:', error);
      toast.error('Erreur lors de la création de la facture');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return;
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Échec de la suppression de la facture');
      setInvoices(invoices.filter((invoice) => invoice.id !== id));
      setFilteredInvoices(filteredInvoices.filter((invoice) => invoice.id !== id));
      toast.success('Facture supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <Container className="my-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Liste des Factures</h1>
        <div className="flex gap-2">
          <Link href="/factures/new">
            <Button variant="contained" color="primary" startIcon={<AddIcon />}>
              Nouvelle Facture
            </Button>
          </Link>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<InputIcon />}
            onClick={handleOpenImportModal}
            className="bg-green-600 hover:bg-green-700"
          >
            Importer Facture
          </Button>
        </div>
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
                <Link href={`/factures/${invoice.id}`}>
                  <BootstrapButton variant="info" size="sm" className="me-2">
                    <i className="bi bi-eye"></i>
                  </BootstrapButton>
                </Link>
                <Link href={`/factures/${invoice.id}/edit`}>
                  <BootstrapButton variant="warning" size="sm" className="me-2">
                    <i className="bi bi-pencil"></i>
                  </BootstrapButton>
                </Link>
                <Link href={`/factures/${invoice.id}/print`}>
                  <BootstrapButton variant="success" size="sm" className="me-2">
                    <i className="bi bi-printer"></i>
                  </BootstrapButton>
                </Link>
                <BootstrapButton
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(invoice.id)}
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
          <Modal.Title>Importer Facture - Sélectionner les Horaires</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nom du Client</Form.Label>
            <Form.Control
              type="text"
              placeholder="Entrer le nom du client"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
          </Form.Group>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Sélectionner</th>
                <th>Enseignant</th>
                <th>Salle</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {nonInvoicedSchedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td>
                    <FormCheck
                      type="checkbox"
                      checked={selectedSchedules.includes(schedule.id)}
                      onChange={() => handleScheduleSelect(schedule.id)}
                    />
                  </td>
                  <td>{schedule.teacher.name}</td>
                  <td>{schedule.classroom.name}</td>
                  <td>{new Date(schedule.startTime).toLocaleString('fr-FR')}</td>
                  <td>{new Date(schedule.endTime).toLocaleString('fr-FR')}</td>
                  <td>{schedule.description || 'Aucune description'}</td>
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
            onClick={handleGenerateInvoice}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Générer Facture
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProtectedRoute(InvoicesList);