"use client"
import React, { useEffect, useState } from "react";
import { Card, ListGroup, Spinner, Alert } from "react-bootstrap";
import Link from "next/link";

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch("/api/teachers");
        if (!response.ok) throw new Error("Failed to fetch teachers");
        const data = await response.json();
        setTeachers(data);
      } catch (error) {
        console.error("Error fetching teachers:", error);
        setError("Failed to fetch teachers.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Card>
      <Card.Body>
        <Card.Title>Teacher List</Card.Title>
        <ListGroup>
          {teachers.map((teacher) => (
            <ListGroup.Item key={teacher.id}>
              <Link href={`/teacher/${teacher.id}`} passHref>
                {teacher.name}
              </Link>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default TeacherList;