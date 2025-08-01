'use client';

import React, { useEffect, useState } from 'react';
import { Card, Table, Spinner, Alert, Button, ButtonGroup, Modal, Container, Form } from 'react-bootstrap';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const router = useRouter();


  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teachers');
      if (!response.ok) throw new Error('Failed to fetch teachers');
      const data = await response.json();
      setTeachers(data);
      setFilteredTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setError('Failed to fetch teachers.');
    } finally {
      setLoading(false);
    }
  };

  // Filter teachers based on search term
  useEffect(() => {
    const filtered = teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeachers(filtered);
  }, [searchTerm, teachers]);

  const handleEdit = (teacherId) => {
    router.push(`/teachers/edit/${teacherId}`);
  };

  const handleDeleteClick = (teacher) => {
    setTeacherToDelete(teacher);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/teachers/${teacherToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete teacher');
      setTeachers(teachers.filter((t) => t.id !== teacherToDelete.id));
      setFilteredTeachers(filteredTeachers.filter((t) => t.id !== teacherToDelete.id));
      setShowDeleteModal(false);
      toast.success('Enseignant supprimé avec succès');
    } catch (error) {
      console.error('Error deleting teacher:', error);
      setError('Failed to delete teacher.');
      toast.error('Erreur lors de la suppression');
    }
  };




  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Liste des Enseignants</h2>
        <Link href="/insertteacher">
          <Button variant="primary">
            <i className="bi bi-plus-circle me-2"></i> Nouvel Enseignant
          </Button>
        </Link>
      </div>

      <Form.Group className="mb-4">
        <Form.Label>Rechercher un enseignant</Form.Label>
        <Form.Control
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Groupes</th>
                <th>Horaires</th>
                <th>Transactions</th>
                <th>Créé le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>{teacher.id}</td>
                  <td>{teacher.name}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.phone || '-'}</td>
                  <td>{teacher.groups?.length || 0}</td>
                  <td>{teacher.schedules?.length || 0}</td>
                  <td>{teacher.transactions?.length || 0}</td>
                  <td>{new Date(teacher.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <ButtonGroup size="sm">
                      <Link href={`/teacher/${teacher.id}`} passHref>
                        <Button variant="info">
                          <i className="bi bi-eye"></i>
                        </Button>
                      </Link>
                      <Button variant="warning" onClick={() => handleEdit(teacher.id)}>
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button variant="danger" onClick={() => handleDeleteClick(teacher)}>
                        <i className="bi bi-trash"></i>
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la Suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer {teacherToDelete?.name} ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProtectedRoute(TeacherList);