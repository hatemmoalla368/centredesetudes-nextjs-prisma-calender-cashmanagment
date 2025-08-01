"use client"
<<<<<<< HEAD
import React, { useState, useEffect, useMemo } from "react";
import { Container, Card, Form, Button, Table, Alert, Row, Col } from "react-bootstrap";
import { MaterialReactTable } from 'material-react-table';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { toast } from "react-toastify";
const GestionDeCaisse = () => {
  const [pagination, setPagination] = useState({
          pageIndex: 0, // Initial page index
          pageSize: 10, // Initial page size
        });
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    type: "income",
    amount: "",
    description: "",
    category: "",
    date:""
  });
  const [filterType, setFilterType] = useState("all"); // "all", "income", "expense"
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const url = `/api/transactions?type=${filterType === "all" ? "" : filterType}&startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = await response.json();
      setTransactions(data);
      setError("");
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Failed to fetch transactions. Please try again.");
    }
  };
const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchTransactions();
        toast.success("transaction deleted successfully!");
      } else {
        throw new Error("Failed to delete transaction.");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error(error.message);
    }
  };
  // Add a new transaction
  const addTransaction = async () => {
    try {
      if (!newTransaction.amount || !newTransaction.description || !newTransaction.category) {
        setError("All fields are required.");
        return;
      }

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTransaction),
      });
      if (!response.ok) throw new Error("Failed to add transaction");
      const data = await response.json();
      setTransactions([data, ...transactions]); // Add new transaction to the list
      setNewTransaction({ type: "income", amount: "", description: "", category: "", date:"" }); // Reset form
      setError("");
      toast.success("transaction added successfully!");
      
    } catch (error) {
      console.error("Error adding transaction:", error);
      setError("Failed to add transaction. Please try again.");
    }
  };

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  // Fetch transactions on component mount or filter change
  useEffect(() => {
    fetchTransactions();
  }, [filterType, startDate, endDate]);
  const columns = useMemo(
    () => [
      {
        accessorKey: "type", // Access the type field
        header: "Type",
        size: 100,
        Cell: ({ cell }) => (
          <span>
            {cell.getValue() === "income" ? "Recu" : "Payé"}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: "amount",
        size: 200,
      },
      {
        accessorKey: "date", // Assuming startTime is in ISO format
        header: "date",
        size: 100,
        Cell: ({ cell }) => new Date(cell.row.original.date).toLocaleString(), // Format the date
      },
     
      {
        accessorKey: "description",
        header: "Description",
        size: 200,
      },
      {
        accessorKey: "category",
        header: "category",
        size: 200,
      },
      {
        accessorKey: "id", // This is where we define the Actions column
        header: "Actions",
        size: 100,
        Cell: ({ cell }) => (
          <div>
            <Button
              onClick={() => handleDelete(cell.row.original.id)}
              variant="contained"
              color="secondary"
              size="small"
              className="text-danger btn-link delete"
            >
              <DeleteForeverIcon />
            </Button>
=======
import { useState, useEffect, useMemo } from "react";
import { 
  Button, Card, Col, Form, Row, Tab, Tabs, 
  Table, Modal, Spinner, Alert, 
  Container
} from "react-bootstrap";
import { 
  IconButton, Typography 
} from "@mui/material";
import { MaterialReactTable } from 'material-react-table';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
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
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
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
      date: new Date().toISOString().split('T')[0] // Default to today

  });

  const [classroomTransaction, setClassroomTransaction] = useState({
    type: "income",
    amount: "",
    description: "",
    teacherId: "",
    status: "completed",
      category: "classroom_rent" ,
        date: new Date().toISOString().split('T')[0] // Default to today


  });

 const [studentTransaction, setStudentTransaction] = useState({
  type: "income", // Reçu by default
  amount: "",
  description: "",
  teacherId: "",
  groupId: "",
  studentId: "",
  status: "completed",
  category: "student_payment",
    date: new Date().toISOString().split('T')[0] // Default to today

});

const [teacherPayment, setTeacherPayment] = useState({
  type: "expense", // Payé by default
  amount: "",
  description: "",
  teacherId: "",
  status: "completed",
  category: "teacher_share",
    date: new Date().toISOString().split('T')[0] // Default to today

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
    // Handle both Date objects and ISO strings
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

    // Remove ID for POST requests
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
const handleEditSubmit = async (e, formData) => {
  e.preventDefault()
  try {
    const response = await fetch(`/api/transactions/${formData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Don't include the ID in the body - it's in the URL
        type: formData.type,
        amount: formData.amount,
        description: formData.description,
        status: formData.status,
        category: formData.category,
        date: formData.date,
        teacherId: formData.teacherId,
        studentId: formData.studentId,
        groupId: formData.groupId
      })
    })

    if (!response.ok) throw new Error('Update failed')
    
    toast.success('Transaction updated!')
    fetchTransactions()
    setEditModalOpen(false)
  } catch (err) {
    toast.error('Failed to update transaction')
    console.error('Update error:', err)
  }
}
  // Handle delete
  const handleDelete = async (id) => {
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
    date: formatDateForInput(transaction.date) // Use the helper here
  });
  setEditModalOpen(true);
};

  // Calculate totals safely
  const totals = useMemo(() => {
    const safeTransactions = Array.isArray(transactions) ? transactions : [];
    
    const filtered = safeTransactions.filter(t => {
      try {
        const transactionDate = new Date(t.date);
        const startDate = filterStartDate ? new Date(filterStartDate) : null;
        const endDate = filterEndDate ? new Date(filterEndDate) : null;
        
        return (
          (!startDate || transactionDate >= startDate) && 
          (!endDate || transactionDate <= endDate) &&
          (filterType === 'all' || t.type === filterType)
        );
      } catch {
        return false;
      }
    });

    const income = filtered
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      
    const expenses = filtered
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      
    return {
      income,
      expenses,
      balance: income - expenses
    };
  }, [transactions, filterStartDate, filterEndDate, filterType]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        Cell: ({ cell }) => {
          try {
            return new Date(cell.getValue()).toLocaleDateString();
          } catch {
            return "Invalid date";
          }
        },
      },
      {
  accessorKey: "type",
  header: "Type",
  Cell: ({ cell }) => {
    const type = cell.getValue();
    let color = "";
    let text = "";
    
    if (type === "income") {
      color = "success.main";
      text = "Reçu";
    } else if (type === "expense") {
      color = "error.main";
      text = "Payé";
    } else if (type === "receivable") {
      color = "info.main";
      text = "Non encore reçu";
    } else if (type === "payable") {
      color = "warning.main";
      text = "Non encore payé";
    }
    
    return <Typography color={color}>{text}</Typography>;
  },
},
      {
        accessorKey: "amount",
        header: "Montant",
        Cell: ({ cell }) => {
          const amount = parseFloat(cell.getValue());
          return isNaN(amount) ? "Invalid" : `${amount.toFixed(2)} DT`;
        },
      },
      {
        accessorKey: "description",
        header: "Description",
      },
      {
  accessorKey: "category",
  header: "Catégorie",
  Cell: ({ cell }) => {
    const category = cell.getValue();
    switch(category) {
      case "salary": return "Salaire";
      case "taxes": return "Taxes";
      case "classroom_rent": return "Location salle"; // Updated display name
      case "student_payment": return "Paiement étudiant";
      case "teacher_share": return "Part enseignant";
      default: return category;
    }
  }
},
      {
        accessorKey: "teacher.name",
        header: "Enseignant",
        Cell: ({ cell }) => cell.getValue() || "-",
      },
      {
        accessorKey: "group.name",
        header: "Groupe",
        Cell: ({ cell }) => cell.getValue() || "-",
      },
      {
        accessorKey: "student.name",
        header: "Étudiant",
        Cell: ({ cell }) => cell.getValue() || "-",
      },
      {
        accessorKey: "id",
        header: "Actions",
        Cell: ({ cell, row }) => (
          <div>
            <IconButton 
              onClick={() => handleEdit(row.original)}
              color="primary"
              size="small"
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              onClick={() => handleDelete(cell.getValue())}
              color="error"
              size="small"
            >
              <DeleteForeverIcon />
            </IconButton>
>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)
          </div>
        ),
      },
    ],
    []
  );
<<<<<<< HEAD
  return (
    <Container className="my-4">
      <h1 className="text-center mb-4">Gestion de Caisse</h1>

      {/* Add Transaction Form */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Ajouter une Transaction</Card.Title>
          <Form>
            <Row>
              <Col md={3}>
                <Form.Group controlId="type">
                  <Form.Label>Type</Form.Label>
                  <Form.Control
                    as="select"
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                  >
                    <option value="income">Reçu</option>
                    <option value="expense">Payé</option>
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="date">
                  <Form.Label>date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="amount">
                  <Form.Label>Montant</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Montant"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="description">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Description"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="category">
                  <Form.Label>Catégorie</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Catégorie"
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="primary" onClick={addTransaction} className="mt-3">
              Ajouter
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Filtres</Card.Title>
          <Row>
            <Col md={3}>
              <Form.Group controlId="filterType">
                <Form.Label>Type</Form.Label>
                <Form.Control
                  as="select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Tous</option>
                  <option value="income">Reçus</option>
                  <option value="expense">Payés</option>
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="startDate">
                <Form.Label>Date de Début</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="endDate">
                <Form.Label>Date de Fin</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
=======
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
 {/* Filter controls */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
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
                <Form.Label>Type</Form.Label>
                <Form.Select
  value={filterType}
  onChange={(e) => setFilterType(e.target.value)}
>
  <option value="all">Tous</option>
  <option value="income">Reçus</option>
  <option value="receivable">Non encore reçus</option>
  <option value="expense">Payés</option>
  <option value="payable">Non encore payés</option>
</Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button variant="primary" onClick={fetchTransactions}>
                Appliquer
              </Button>
>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)
            </Col>
          </Row>
        </Card.Body>
      </Card>
<<<<<<< HEAD

      {/* Error Message */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Transactions List */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Transactions</Card.Title>
          
        </Card.Body>
      </Card>
      <MaterialReactTable
        key={transactions.length} // Force re-render when data changes
        columns={columns}
        data={transactions}
        initialState={{ pagination }}
        onPaginationChange={(newPagination) => {
          console.log('Pagination Changed:', newPagination);
          setPagination(newPagination);
        }}
        state={{ pagination: pagination }} // Ensure controlled pagination state
        manualPagination={false} // Ensure the table handles pagination internally
      />
      {/* Totals */}
      <Card>
        <Card.Body>
          <Card.Title>Totaux</Card.Title>
          <p>Total Reçus: {totalIncome.toFixed(2)}</p>
          <p>Total Payés: {totalExpenses.toFixed(2)}</p>
          <p>Solde Net: {netBalance.toFixed(2)}</p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GestionDeCaisse;
=======
      {/* Transactions table */}
      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          {transactions.length === 0 ? (
            <Alert variant="info">Aucune transaction trouvée</Alert>
          ) : (
            <MaterialReactTable
              columns={columns}
              data={transactions}
              initialState={{ pagination }}
              onPaginationChange={setPagination}
              state={{ pagination }}
              manualPagination={false}
            />
          )}
        </>
      )}

      {/* Totals card */}
      <Card className="mt-4">
        <Card.Body>
          <Card.Title>Totaux</Card.Title>
          <p>Total Reçus: {totals.income.toFixed(2)} DT</p>
          <p>Total Payés: {totals.expenses.toFixed(2)} DT</p>
          <p>Solde Net: {totals.balance.toFixed(2)} DT</p>
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
>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)
