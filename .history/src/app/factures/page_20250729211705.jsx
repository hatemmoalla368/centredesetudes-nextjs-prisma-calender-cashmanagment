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
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [clientAddress, setClientAddress] = useState('');
  const [taxRate, setTaxRate]= useState(19)
    const [discount, setDiscount]= useState(0)
  const [timbreFiscal, setTimbreFiscale]= useState(1)

  const [pricePerSchedule, setPricePerSchedule] = useState(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch('/api/invoices');
        if (!res.ok) throw new Error('Échec de la récupération des factures');
        const data = await res.json();
        console.log('Fetched invoices:', data); // Log invoices
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

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch('/api/teachers');
        if (!res.ok) throw new Error('Échec de la récupération des enseignants');
        const data = await res.json();
        setTeachers(data);
        setFilteredTeachers(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des enseignants:', error);
        toast.error('Erreur lors de la récupération des enseignants');
      }
    };
    fetchTeachers();
  }, []);

  useEffect(() => {
    const filtered = teachers.filter((teacher) =>
      teacher.name.toLowerCase().includes(teacherSearch.toLowerCase())
    );
    setFilteredTeachers(filtered);
  }, [teacherSearch, teachers]);

  const fetchNonInvoicedSchedules = async (teacherId = null) => {
    try {
      const url = teacherId
        ? `/api/schedules/non-invoiced?teacherId=${teacherId}&t=${Date.now()}`
        : `/api/schedules/non-invoiced?t=${Date.now()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Échec de la récupération des horaires non facturés');
      const data = await res.json();
      console.log('Non-invoiced schedules:', data); // Log schedules
      setNonInvoicedSchedules(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des horaires non facturés:', error);
      toast.error('Erreur lors de la récupération des horaires non facturés');
    }
  };

  const handleOpenImportModal = () => {
    setShowImportModal(true);
    setTeacherSearch('');
    setSelectedTeacher(null);
    setClientAddress('');
    setPricePerSchedule(20);
    setSelectedSchedules([]);
    setFilteredTeachers(teachers);
    fetchNonInvoicedSchedules();
    setTimbreFiscale(1);
    setDiscount(0);
    setTaxRate(19);
  };

  const handleTeacherSelect = (teacher) => {
    console.log('Selected teacher ID:', teacher.id); // Log teacher ID
    setSelectedTeacher(teacher);
    setTeacherSearch(teacher.name);
    setFilteredTeachers([]);
    fetchNonInvoicedSchedules(teacher.id);
  };

  const handleScheduleSelect = (scheduleId) => {
    setSelectedSchedules((prev) =>
      prev.includes(scheduleId)
        ? prev.filter((id) => id !== scheduleId)
        : [...prev, scheduleId]
    );
  };

  const handleGenerateInvoice = async (e) => {
    if (!selectedTeacher) {
      toast.error('Veuillez sélectionner un enseignant');
      return;
    }
    if (!clientAddress) {
      toast.error('Veuillez entrer l’adresse du client');
      return;
    }
    if (selectedSchedules.length === 0) {
      toast.error('Veuillez sélectionner au moins un horaire');
      return;
    }
    if (pricePerSchedule <= 0) {
      toast.error('Veuillez entrer un prix valide par horaire');
      return;
    }

    try {
      const invoiceNumber = 'FCT-000001';
      const grandTotal = selectedSchedules.length * pricePerSchedule;
     const taxAmount = ((grandTotal-timbreFiscal)*(taxRate/100))/(1+(taxRate/100));
     //const total = grandTotal-timbreFiscal-taxAmount;
      const date = new Date().toISOString();
      const clientName = selectedTeacher.name;
      const items = selectedSchedules.map((id) => {
        const schedule = nonInvoicedSchedules.find((s) => s.id === id);
        return {
          description:  `location Horaire ${schedule?.classroom.name} (${new Date(schedule?.startTime).toLocaleString('fr-FR')})`,
          quantity: 1,
          unitPrice: pricePerSchedule,
          total: pricePerSchedule,
        };
      });

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber,
          clientName,
          clientAddress,
          date,
          timbreFiscal,
          taxAmount,
          grandTotal,
          items,
          scheduleIds: selectedSchedules,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la création de la facture');
      }

      // Refresh invoices
      const res = await fetch('/api/invoices');
      if (!res.ok) throw new Error('Échec de la récupération des factures');
      const data = await res.json();
      setInvoices(data);
      setFilteredInvoices(data);
      setShowImportModal(false);
      setSelectedTeacher(null);
      setTeacherSearch('');
      setClientAddress('');
      setPricePerSchedule(20);
      setSelectedSchedules([]);
      setTimbreFiscale(1);
    setDiscount(0);
    setTaxRate(19);
      toast.success('Facture créée avec succès');
    } catch (error) {
      console.error('Erreur lors de la création de la facture:', error);
      toast.error(error.message);
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
      // Refresh non-invoiced schedules for the current teacher
      if (selectedTeacher) {
        fetchNonInvoicedSchedules(selectedTeacher.id);
      } else {
        fetchNonInvoicedSchedules();
      }
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
              <td>{invoice.grandTotal != null ? invoice.grandTotal.toFixed(3) : '0.000'}</td>
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
            <Form.Label>Rechercher un Enseignant</Form.Label>
            <Form.Control
              type="text"
              placeholder="Entrer le nom de l’enseignant"
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
            />
            {filteredTeachers.length > 0 && (
              <ul className="border border-gray-300 rounded mt-2 max-h-40 overflow-y-auto">
                {filteredTeachers.map((teacher) => (
                  <li
                    key={teacher.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleTeacherSelect(teacher)}
                  >
                    {teacher.name}
                  </li>
                ))}
              </ul>
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Adresse du Client</Form.Label>
            <Form.Control
              type="text"
              placeholder="Entrer l’adresse du client"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Prix par Horaire (TND)</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              value={pricePerSchedule}
              onChange={(e) => setPricePerSchedule(parseFloat(e.target.value) || 0)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
                  <Form.Label>Taux de TVA (%)</Form.Label>
                  <Form.Control
                    type="number"
                    name="taxRate"
                    value={taxRate}
                    onChange={setTaxRate(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>discount</Form.Label>
                  <Form.Control
                    type="number"
                    name="discount"
                    value={discount}
                    placeholder="Remise"
                    onChange={setDiscount(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Timbre Fiscale</Form.Label>
                  <Form.Control
                    type="number"
                    name="timbreFiscale"
                      placeholder="timbre fiscale"

                    value={timbreFiscal}
                    onChange={setTimbreFiscale(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                </Form.Group>
          {selectedTeacher && (
            <>
              <h5 className="mb-3">Horaires non facturés pour {selectedTeacher.name}</h5>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Sélectionner</th>
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
                      <td>{schedule.classroom.name}</td>
                      <td>{new Date(schedule.startTime).toLocaleString('fr-FR')}</td>
                      <td>{new Date(schedule.endTime).toLocaleString('fr-FR')}</td>
                      <td>{schedule.description || 'Aucune description'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
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