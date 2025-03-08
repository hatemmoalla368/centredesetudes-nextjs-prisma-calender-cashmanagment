"use client"
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
          </div>
        ),
      },
    ],
    []
  );
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
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Error Message */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Transactions List */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Transactions</Card.Title>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Montant</th>
                <th>Description</th>
                <th>Catégorie</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>{t.type === "income" ? "Reçu" : "Payé"}</td>
                  <td>{t.amount}</td>
                  <td>{t.description}</td>
                  <td>{t.category}</td>
                </tr>
              ))}
            </tbody>
          </Table>
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