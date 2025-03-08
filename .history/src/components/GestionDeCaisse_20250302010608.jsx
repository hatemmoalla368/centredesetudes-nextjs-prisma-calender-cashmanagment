"use client"
import React, { useState, useEffect } from "react";

const GestionDeCaisse = () => {
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    type: "income",
    amount: "",
    description: "",
    category: "",
  });
  const [filterType, setFilterType] = useState("all"); // "all", "income", "expense"
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const url = `/api/transactions?type=${filterType === "all" ? "" : filterType}&startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // Add a new transaction
  const addTransaction = async () => {
    try {
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
      setNewTransaction({ type: "income", amount: "", description: "", category: "" }); // Reset form
    } catch (error) {
      console.error("Error adding transaction:", error);
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

  return (
    <div>
      <h1>Gestion de Caisse</h1>

      {/* Add Transaction Form */}
      <div>
        <h2>Ajouter une Transaction</h2>
        <select
          value={newTransaction.type}
          onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
        >
          <option value="income">Reçu</option>
          <option value="expense">Payé</option>
        </select>
        <input
          type="number"
          placeholder="Montant"
          value={newTransaction.amount}
          onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={newTransaction.description}
          onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
        />
        <input
          type="text"
          placeholder="Catégorie"
          value={newTransaction.category}
          onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
        />
        <button onClick={addTransaction}>Ajouter</button>
      </div>

      {/* Filters */}
      <div>
        <h2>Filtres</h2>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">Tous</option>
          <option value="income">Reçus</option>
          <option value="expense">Payés</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* Transactions List */}
      <div>
        <h2>Transactions</h2>
        <table>
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
        </table>
      </div>

      {/* Totals */}
      <div>
        <h2>Totaux</h2>
        <p>Total Reçus: {totalIncome}</p>
        <p>Total Payés: {totalExpenses}</p>
        <p>Solde Net: {netBalance}</p>
      </div>
    </div>
  );
};

export default GestionDeCaisse;