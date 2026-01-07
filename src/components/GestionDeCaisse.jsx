"use client"
import { useState, useEffect } from "react";
import { 
  Button, Card, Col, Form, Row, Tab, Tabs, 
  Modal, Spinner, Alert, Container, InputGroup, FormControl
} from "react-bootstrap";
import { 
  IconButton, Typography 
} from "@mui/material";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'next/navigation';
import ProtectedRoute from "./ProtectedRoute";

const GestionDeCaisse = () => {
  const router = useRouter();
  // State management
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState("general");
  const [transactions, setTransactions] = useState([]);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  // Form states
  const [generalTransaction, setGeneralTransaction] = useState({
    type: "income",
    amount: "",
    description: "",
    category: "salary",
    status: "completed",
    date: new Date().toISOString().split('T')[0]
  });

  const [classroomTransaction, setClassroomTransaction] = useState({
    type: "income",
    amount: "",
    description: "",
    teacherId: "",
    status: "completed",
    category: "classroom_rent",
    date: new Date().toISOString().split('T')[0]
  });

  const [studentTransaction, setStudentTransaction] = useState({
    type: "income",
    amount: "",
    description: "",
    teacherId: "",
    groupId: "",
    studentId: "",
    status: "completed",
    category: "student_payment",
    date: new Date().toISOString().split('T')[0]
  });

  const [teacherPayment, setTeacherPayment] = useState({
    type: "expense",
    amount: "",
    description: "",
    teacherId: "",
    status: "completed",
    category: "teacher_share",
    date: new Date().toISOString().split('T')[0]
  });

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [teachersRes] = await Promise.all([
          fetch('/api/teachers')
        ]);
        const teachersData = await teachersRes.json();
        setTeachers(Array.isArray(teachersData) ? teachersData : []);
        fetchTransactions();
      } catch (err) {
        setError("Failed to load initial data");
        toast.error("Failed to load initial data");
      }
    };
    fetchInitialData();
  }, []);

  // Date formatting helper
  const formatDateForInput = (dateString) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date().toISOString().split('T')[0];
      }
      return date.toISOString().split('T')[0];
    } catch (e) {
      console.error("Error formatting date:", e);
      return new Date().toISOString().split('T')[0];
    }
  };

  // Fetch transactions with error handling
  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterStartDate) params.append('startDate', filterStartDate);
      if (filterEndDate) params.append('endDate', filterEndDate);
      if (filterType !== 'all') params.append('type', filterType);
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (searchQuery) params.append('search', searchQuery);

      const url = `/api/transactions?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load transactions");
      setTransactions([]);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  // Fetch groups for selected teacher
  const fetchGroups = async (teacherId) => {
    try {
      const response = await fetch(`/api/teachers/${teacherId}/groups`);
      if (!response.ok) throw new Error("Failed to fetch groups");
      
      const data = await response.json();
      setGroups(Array.isArray(data) ? data : []);
      setStudents([]);
      setStudentTransaction(prev => ({
        ...prev,
        groupId: "",
        studentId: ""
      }));
    } catch (err) {
      toast.error("Failed to load groups");
      setGroups([]);
    }
  };

  // Handle group selection
  const handleGroupSelect = (groupId) => {
    const selectedGroup = groups.find(g => g.id.toString() === groupId);
    setStudents(Array.isArray(selectedGroup?.students) ? selectedGroup.students : []);
    setStudentTransaction(prev => ({
      ...prev,
      groupId,
      studentId: ""
    }));
  };

  // Handle form submissions
  const handleSubmit = async (e, formData, isEdit = false) => {
    e.preventDefault();
    try {
      const url = isEdit 
        ? `/api/transactions/${formData.id}` 
        : '/api/transactions';
      const method = isEdit ? 'PUT' : 'POST';

      const submissionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: formData.date || new Date().toISOString(),
        teacherId: formData.teacherId ? parseInt(formData.teacherId) : null,
        studentId: formData.studentId ? parseInt(formData.studentId) : null,
        groupId: formData.groupId ? parseInt(formData.groupId) : null
      };

      if (!isEdit) {
        delete submissionData.id;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      toast.success(`Transaction ${isEdit ? 'updated' : 'added'} successfully!`);
      fetchTransactions();
      if (isEdit) setEditModalOpen(false);
    } catch (err) {
      console.error("Error:", err);
      toast.error(`Failed to ${isEdit ? 'update' : 'add'} transaction`);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette transaction?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error("Delete failed");
      
      toast.success("Transaction deleted!");
      fetchTransactions();
    } catch (err) {
      toast.error("Failed to delete transaction");
    }
  };

  // Handle edit click
  const handleEdit = (transaction) => {
    setCurrentTransaction({
      ...transaction,
      amount: transaction.amount.toString(),
      date: formatDateForInput(transaction.date)
    });
    setEditModalOpen(true);
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchQuery === '' || 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.teacher?.name && transaction.teacher.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.student?.name && transaction.student.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  // Calculate totals
  const totals = {
    income: filteredTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
    expenses: filteredTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
    balance: 0
  };
  totals.balance = totals.income - totals.expenses;

  // Helper function to get category display name
  const getCategoryDisplayName = (category) => {
    switch(category) {
      case "salary": return "Salaire";
      case "taxes": return "Taxes";
      case "classroom_rent": return "Location salle";
      case "student_payment": return "Paiement étudiant";
      case "teacher_share": return "Part enseignant";
      default: return category;
    }
  };

  // Helper function to get type display name and color
  const getTypeDisplay = (type) => {
    switch(type) {
      case "income": return { text: "Reçu", color: "success.main" };
      case "expense": return { text: "Payé", color: "error.main" };
      case "receivable": return { text: "Non encore reçu", color: "info.main" };
      case "payable": return { text: "Non encore payé", color: "warning.main" };
      default: return { text: type, color: "text.primary" };
    }
  };

  if (isAuthLoading) {
    return (
      <Container className="my-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <div className="container my-4">
      <h1 className="text-center mb-4">Gestion de Caisse</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Transaction tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
        <Tab eventKey="general" title="Transaction Générale">
          <Card className="mt-3">
            <Card.Body>
              <Card.Title>Ajouter une Transaction Générale</Card.Title>
              <Form onSubmit={(e) => handleSubmit(e, generalTransaction)}>
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={generalTransaction.date}
                        onChange={(e) => setGeneralTransaction({
                          ...generalTransaction,
                          date: e.target.value
                        })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Type</Form.Label>
                      <Form.Select 
                        value={generalTransaction.type}
                        onChange={(e) => setGeneralTransaction({
                          ...generalTransaction,
                          type: e.target.value
                        })}
                      >
                        <option value="income">Reçu</option>
                        <option value="expense">Payé</option>
                        <option value="receivable">Non encore reçu</option>
                        <option value="payable">Non encore payé</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Statut</Form.Label>
                      <Form.Select
                        value={generalTransaction.status}
                        onChange={(e) => setGeneralTransaction({
                          ...generalTransaction,
                          status: e.target.value
                        })}
                      >
                        <option value="completed">Complété</option>
                        <option value="pending">En attente</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Catégorie</Form.Label>
                      <Form.Select
                        value={generalTransaction.category}
                        onChange={(e) => setGeneralTransaction({
                          ...generalTransaction,
                          category: e.target.value
                        })}
                      >
                        <option value="salary">Salaire</option>
                        <option value="taxes">Taxes</option>
                        <option value="other">Autre</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Montant (DT)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={generalTransaction.amount}
                        onChange={(e) => setGeneralTransaction({
                          ...generalTransaction,
                          amount: e.target.value
                        })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        value={generalTransaction.description}
                        onChange={(e) => setGeneralTransaction({
                          ...generalTransaction,
                          description: e.target.value
                        })}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" type="submit">
                  Enregistrer
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="location" title="Location Salle">
          <Card className="mt-3">
            <Card.Body>
              <Card.Title>Ajouter une Transaction Location</Card.Title>
              <Form onSubmit={(e) => handleSubmit(e, classroomTransaction)}>
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={classroomTransaction.date}
                        onChange={(e) => setClassroomTransaction({
                          ...classroomTransaction,
                          date: e.target.value
                        })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Type</Form.Label>
                      <Form.Select 
                        value={classroomTransaction.type}
                        onChange={(e) => setClassroomTransaction({
                          ...classroomTransaction,
                          type: e.target.value
                        })}
                      >
                        <option value="income">Reçu</option>
                        <option value="receivable">Non encore reçu</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Statut</Form.Label>
                      <Form.Select
                        value={classroomTransaction.status}
                        onChange={(e) => setClassroomTransaction({
                          ...classroomTransaction,
                          status: e.target.value
                        })}
                      >
                        <option value="completed">Complété</option>
                        <option value="pending">En attente</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Enseignant</Form.Label>
                      <Form.Select
                        value={classroomTransaction.teacherId}
                        onChange={(e) => setClassroomTransaction({
                          ...classroomTransaction,
                          teacherId: e.target.value
                        })}
                        required
                      >
                        <option value="">Sélectionner</option>
                        {teachers.map(teacher => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Montant (DT)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={classroomTransaction.amount}
                        onChange={(e) => setClassroomTransaction({
                          ...classroomTransaction,
                          amount: e.target.value
                        })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        value={classroomTransaction.description}
                        onChange={(e) => setClassroomTransaction({
                          ...classroomTransaction,
                          description: e.target.value
                        })}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" type="submit">
                  Enregistrer
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="student" title="Étudiant">
          <Card className="mt-3">
            <Card.Body>
              <Card.Title>Ajouter une Transaction Étudiant</Card.Title>
              <Form onSubmit={(e) => handleSubmit(e, studentTransaction)}>
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={studentTransaction.date}
                        onChange={(e) => setStudentTransaction({
                          ...studentTransaction,
                          date: e.target.value
                        })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Type</Form.Label>
                      <Form.Select 
                        value={studentTransaction.type}
                        onChange={(e) => setStudentTransaction({
                          ...studentTransaction,
                          type: e.target.value
                        })}
                      >
                        <option value="income">Reçu</option>
                        <option value="receivable">Non encore reçu</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Statut</Form.Label>
                      <Form.Select
                        value={studentTransaction.status}
                        onChange={(e) => setStudentTransaction({
                          ...studentTransaction,
                          status: e.target.value
                        })}
                      >
                        <option value="completed">Complété</option>
                        <option value="pending">En attente</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Enseignant</Form.Label>
                      <Form.Select
                        value={studentTransaction.teacherId}
                        onChange={async (e) => {
                          const teacherId = e.target.value;
                          setStudentTransaction(prev => ({
                            ...prev,
                            teacherId,
                            groupId: "",
                            studentId: ""
                          }));
                          if (teacherId) await fetchGroups(teacherId);
                        }}
                        required
                      >
                        <option value="">Sélectionner</option>
                        {teachers.map(teacher => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Groupe</Form.Label>
                      <Form.Select
                        value={studentTransaction.groupId}
                        onChange={(e) => handleGroupSelect(e.target.value)}
                        disabled={!studentTransaction.teacherId}
                        required
                      >
                        <option value="">Sélectionner</option>
                        {groups.map(group => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Étudiant</Form.Label>
                      <Form.Select
                        value={studentTransaction.studentId}
                        onChange={(e) => setStudentTransaction({
                          ...studentTransaction,
                          studentId: e.target.value
                        })}
                        disabled={!studentTransaction.groupId}
                        required
                      >
                        <option value="">Sélectionner</option>
                        {students.map(student => (
                          <option key={student.id} value={student.id}>
                            {student.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Montant (DT)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={studentTransaction.amount}
                        onChange={(e) => setStudentTransaction({
                          ...studentTransaction,
                          amount: e.target.value
                        })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Catégorie</Form.Label>
                      <Form.Select
                        value={studentTransaction.category}
                        onChange={(e) => setStudentTransaction({
                          ...studentTransaction,
                          category: e.target.value
                        })}
                      >
                        <option value="student_payment">Paiement étudiant</option>
                        <option value="other">Autre</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={studentTransaction.description}
                        onChange={(e) => setStudentTransaction({
                          ...studentTransaction,
                          description: e.target.value
                        })}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" type="submit">
                  Enregistrer
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="teacher_payment" title="Paiement Enseignant">
          <Card className="mt-3">
            <Card.Body>
              <Card.Title>Paiement de l'Enseignant</Card.Title>
              <Form onSubmit={(e) => handleSubmit(e, teacherPayment)}>
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={teacherPayment.date}
                        onChange={(e) => setTeacherPayment({
                          ...teacherPayment,
                          date: e.target.value
                        })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Type</Form.Label>
                      <Form.Select 
                        value={teacherPayment.type}
                        onChange={(e) => setTeacherPayment({
                          ...teacherPayment,
                          type: e.target.value
                        })}
                      >
                        <option value="expense">Payé</option>
                        <option value="payable">Non encore payé</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Statut</Form.Label>
                      <Form.Select
                        value={teacherPayment.status}
                        onChange={(e) => setTeacherPayment({
                          ...teacherPayment,
                          status: e.target.value
                        })}
                      >
                        <option value="completed">Complété</option>
                        <option value="pending">En attente</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Enseignant</Form.Label>
                      <Form.Select
                        value={teacherPayment.teacherId}
                        onChange={(e) => setTeacherPayment({
                          ...teacherPayment,
                          teacherId: e.target.value
                        })}
                        required
                      >
                        <option value="">Sélectionner</option>
                        {teachers.map(teacher => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Montant (DT)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={teacherPayment.amount}
                        onChange={(e) => setTeacherPayment({
                          ...teacherPayment,
                          amount: e.target.value
                        })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        value={teacherPayment.description}
                        onChange={(e) => setTeacherPayment({
                          ...teacherPayment,
                          description: e.target.value
                        })}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" type="submit">
                  Enregistrer Paiement
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Filters and Search */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Date de début</Form.Label>
                <Form.Control 
                  type="date" 
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Date de fin</Form.Label>
                <Form.Control 
                  type="date" 
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Type de transaction</Form.Label>
                <Form.Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Tous les types</option>
                  <option value="income">Reçus</option>
                  <option value="expense">Payés</option>
                  <option value="receivable">À recevoir</option>
                  <option value="payable">À payer</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Catégorie</Form.Label>
                <Form.Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">Toutes les catégories</option>
                  <option value="salary">Salaire</option>
                  <option value="taxes">Taxes</option>
                  <option value="classroom_rent">Location salle</option>
                  <option value="student_payment">Paiement étudiant</option>
                  <option value="teacher_share">Part enseignant</option>
                  <option value="other">Autre</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Recherche</Form.Label>
                <InputGroup>
                  <FormControl
                    placeholder="Rechercher par description, enseignant, étudiant..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button variant="outline-secondary">
                    <SearchIcon />
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button variant="primary" onClick={fetchTransactions} className="me-2">
                Appliquer les filtres
              </Button>
              <Button variant="secondary" onClick={() => {
                setFilterStartDate('');
                setFilterEndDate('');
                setFilterType('all');
                setFilterCategory('all');
                setSearchQuery('');
                fetchTransactions();
              }}>
                Réinitialiser
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Transactions table */}
      <Card>
        <Card.Body>
          <Card.Title>Liste des Transactions</Card.Title>
          
          {loading ? (
            <div className="text-center my-4">
              <Spinner animation="border" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <Alert variant="info">Aucune transaction trouvée</Alert>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Montant</th>
                    <th>Description</th>
                    <th>Catégorie</th>
                    <th>Enseignant</th>
                    <th>Étudiant</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => {
                    const typeDisplay = getTypeDisplay(transaction.type);
                    return (
                      <tr key={transaction.id}>
                        <td>
                          {new Date(transaction.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td>
                          <Typography color={typeDisplay.color}>
                            {typeDisplay.text}
                          </Typography>
                        </td>
                        <td>
                          <strong>{parseFloat(transaction.amount).toFixed(2)} DT</strong>
                        </td>
                        <td>{transaction.description}</td>
                        <td>{getCategoryDisplayName(transaction.category)}</td>
                        <td>{transaction.teacher?.name || "-"}</td>
                        <td>{transaction.student?.name || "-"}</td>
                        <td>
                          <span className={`badge ${transaction.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                            {transaction.status === 'completed' ? 'Complété' : 'En attente'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <IconButton 
                              onClick={() => handleEdit(transaction)}
                              color="primary"
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              onClick={() => handleDelete(transaction.id)}
                              color="error"
                              size="small"
                            >
                              <DeleteForeverIcon />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Totals card */}
      <Card className="mt-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Card className="bg-success bg-opacity-10 border-success">
                <Card.Body>
                  <Card.Title>Total Reçus</Card.Title>
                  <h3 className="text-success">{totals.income.toFixed(2)} DT</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="bg-danger bg-opacity-10 border-danger">
                <Card.Body>
                  <Card.Title>Total Payés</Card.Title>
                  <h3 className="text-danger">{totals.expenses.toFixed(2)} DT</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className={`bg-${totals.balance >= 0 ? 'info' : 'warning'} bg-opacity-10 border-${totals.balance >= 0 ? 'info' : 'warning'}`}>
                <Card.Body>
                  <Card.Title>Solde Net</Card.Title>
                  <h3 className={`text-${totals.balance >= 0 ? 'info' : 'warning'}`}>
                    {totals.balance.toFixed(2)} DT
                  </h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Edit Modal */}
      <Modal show={editModalOpen} onHide={() => setEditModalOpen(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Modifier Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentTransaction && (
            <Form onSubmit={(e) => handleSubmit(e, currentTransaction, true)}>
              <input type="hidden" name="id" value={currentTransaction.id} />
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={formatDateForInput(currentTransaction.date)}
                      onChange={(e) => setCurrentTransaction({
                        ...currentTransaction,
                        date: e.target.value
                      })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type</Form.Label>
                    <Form.Select 
                      value={currentTransaction.type}
                      onChange={(e) => setCurrentTransaction({
                        ...currentTransaction,
                        type: e.target.value
                      })}
                    >
                      <option value="income">Reçu</option>
                      <option value="expense">Payé</option>
                      <option value="receivable">À recevoir</option>
                      <option value="payable">À payer</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Statut</Form.Label>
                    <Form.Select
                      value={currentTransaction.status}
                      onChange={(e) => setCurrentTransaction({
                        ...currentTransaction,
                        status: e.target.value
                      })}
                    >
                      <option value="completed">Complété</option>
                      <option value="pending">En attente</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Catégorie</Form.Label>
                    <Form.Control
                      as="select"
                      value={currentTransaction.category}
                      onChange={(e) => setCurrentTransaction({
                        ...currentTransaction,
                        category: e.target.value
                      })}
                    >
                      <option value="salary">Salaire</option>
                      <option value="taxes">Taxes</option>
                      <option value="classroom_rent">Location salle</option>
                      <option value="student_payment">Paiement étudiant</option>
                      <option value="teacher_share">Part enseignant</option>
                      <option value="other">Autre</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Montant (DT)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={currentTransaction.amount}
                      onChange={(e) => setCurrentTransaction({
                        ...currentTransaction,
                        amount: e.target.value
                      })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      value={currentTransaction.description}
                      onChange={(e) => setCurrentTransaction({
                        ...currentTransaction,
                        description: e.target.value
                      })}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              {currentTransaction.category === "student_payment" && (
                <>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Enseignant</Form.Label>
                        <Form.Select
                          value={currentTransaction.teacherId || ""}
                          onChange={(e) => setCurrentTransaction({
                            ...currentTransaction,
                            teacherId: e.target.value
                          })}
                        >
                          <option value="">Sélectionner</option>
                          {teachers.map(teacher => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Étudiant</Form.Label>
                        <Form.Select
                          value={currentTransaction.studentId || ""}
                          onChange={(e) => setCurrentTransaction({
                            ...currentTransaction,
                            studentId: e.target.value
                          })}
                        >
                          <option value="">Sélectionner</option>
                          {students.map(student => (
                            <option key={student.id} value={student.id}>
                              {student.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </>
              )}
              <div className="d-flex justify-content-end mt-3">
                <Button 
                  variant="secondary" 
                  onClick={() => setEditModalOpen(false)}
                  className="me-2"
                >
                  Annuler
                </Button>
                <Button variant="primary" type="submit">
                  Enregistrer
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProtectedRoute(GestionDeCaisse);