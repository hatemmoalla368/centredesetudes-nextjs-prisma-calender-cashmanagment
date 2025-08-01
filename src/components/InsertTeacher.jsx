<<<<<<< HEAD
"use client"
import React, { useState } from "react";
import { Card, Form, Button, Alert, Spinner } from "react-bootstrap";
=======
"use client";
import { useAuth } from "@/contexts/AuthContext";
import React, { useState } from "react";
import { Card, Form, Button, Alert, Spinner, Row, Col, Modal } from "react-bootstrap";
import { useRouter } from 'next/navigation';
import ProtectedRoute from "./ProtectedRoute";
>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)

const InsertTeacher = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
<<<<<<< HEAD
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
=======
    byStudent: false,
  });
const router = useRouter();
  const [groups, setGroups] = useState([
    {
      name: "",
      students: [{ name: "", phone: "" }],
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);


  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleGroupChange = (groupIndex, field, value) => {
    const newGroups = [...groups];
    newGroups[groupIndex][field] = value;
    setGroups(newGroups);
  };

  const handleStudentChange = (groupIndex, studentIndex, field, value) => {
    const newGroups = [...groups];
    newGroups[groupIndex].students[studentIndex][field] = value;
    setGroups(newGroups);
  };

  const addGroup = () => {
    setGroups([
      ...groups,
      {
        name: "",
        students: [{ name: "", phone: "" }],
      },
    ]);
  };

  const removeGroup = (groupIndex) => {
    if (groups.length > 1) {
      const updated = [...groups];
      updated.splice(groupIndex, 1);
      setGroups(updated);
    }
  };

  const addStudent = (groupIndex) => {
    const newGroups = [...groups];
    newGroups[groupIndex].students.push({ name: "", phone: "" });
    setGroups(newGroups);
  };

  const removeStudent = (groupIndex, studentIndex) => {
    const newGroups = [...groups];
    if (newGroups[groupIndex].students.length > 1) {
      newGroups[groupIndex].students.splice(studentIndex, 1);
      setGroups(newGroups);
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.email) {
      setError("Name and email are required.");
      return false;
    }

    if (formData.byStudent) {
      for (const group of groups) {
        if (!group.name) {
          setError("All groups must have a name.");
          return false;
        }
        for (const student of group.students) {
          if (!student.name || !student.phone) {
            setError("All students must have a name and phone number.");
            return false;
          }
        }
      }
    }

    return true;
>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
<<<<<<< HEAD

    // Validate input
    if (!formData.name || !formData.email) {
      setError("Name and email are required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/teachers", {
=======
    setError("");

    if (!validateForm()) return;

    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);
    setShowConfirm(false);

    const payload = {
      ...formData,
      groups: formData.byStudent
        ? groups.map((group) => ({
            name: group.name,
            students: group.students,
          }))
        : [],
    };

    try {
      const response = await fetch("/api/teachers/full", {
>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
<<<<<<< HEAD
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to add teacher.");
      }

      const data = await response.json();
      setSuccess("Teacher added successfully!");
      setFormData({ name: "", email: "", phone: "" }); // Reset form
    } catch (error) {
      console.error("Error adding teacher:", error);
      setError("Failed to add teacher. Please try again.");
=======
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to add teacher");

      setSuccess("Teacher added successfully!");
      resetForm();
    } catch (err) {
      console.error(err);
      setError("Failed to add teacher. Try again.");
>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  return (
    <Card>
      <Card.Body>
        <Card.Title>Add a New Teacher</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="name" className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter teacher's name"
              required
            />
          </Form.Group>

          <Form.Group controlId="email" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter teacher's email"
              required
            />
          </Form.Group>

          <Form.Group controlId="phone" className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter teacher's phone number"
            />
          </Form.Group>

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <span className="ms-2">Adding...</span>
              </>
            ) : (
              "Add Teacher"
            )}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default InsertTeacher;
=======
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      byStudent: false,
    });
    setGroups([{ name: "", students: [{ name: "", phone: "" }] }]);
  };

  return (
    <>
      <Card>
        <Card.Body>
          <Card.Title>Add New Teacher</Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="byStudent"
                label="Add with groups and students"
                checked={formData.byStudent}
                onChange={(e) =>
                  setFormData({ ...formData, byStudent: e.target.checked })
                }
              />
            </Form.Group>

            {formData.byStudent && (
              <>
                <h4>Groups</h4>
                {groups.map((group, groupIndex) => (
                  <div key={groupIndex} className="mb-4 p-3 border rounded">
                    <Form.Group className="mb-3">
                      <Form.Label>Group Name</Form.Label>
                      <div className="d-flex">
                        <Form.Control
                          value={group.name}
                          onChange={(e) =>
                            handleGroupChange(groupIndex, "name", e.target.value)
                          }
                          required
                        />
                        <Button
                          variant="danger"
                          onClick={() => removeGroup(groupIndex)}
                          className="ms-2"
                          disabled={groups.length === 1}
                        >
                          ×
                        </Button>
                      </div>
                    </Form.Group>

                    <h5>Students</h5>
                    {group.students.map((student, studentIndex) => (
                      <Row key={studentIndex} className="mb-2">
                        <Col>
                          <Form.Control
                            placeholder="Student Name"
                            value={student.name}
                            onChange={(e) =>
                              handleStudentChange(
                                groupIndex,
                                studentIndex,
                                "name",
                                e.target.value
                              )
                            }
                            required
                          />
                        </Col>
                        <Col>
                          <Form.Control
                            placeholder="Phone Number"
                            value={student.phone}
                            onChange={(e) =>
                              handleStudentChange(
                                groupIndex,
                                studentIndex,
                                "phone",
                                e.target.value
                              )
                            }
                            required
                          />
                        </Col>
                        <Col xs="auto">
                          <Button
                            variant="danger"
                            onClick={() => removeStudent(groupIndex, studentIndex)}
                            disabled={group.students.length === 1}
                          >
                            ×
                          </Button>
                        </Col>
                      </Row>
                    ))}

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => addStudent(groupIndex)}
                      className="me-2"
                    >
                      + Add Student
                    </Button>
                  </div>
                ))}

                <Button
                  variant="primary"
                  size="sm"
                  onClick={addGroup}
                  className="mb-3"
                >
                  + Add Group
                </Button>
              </>
            )}

            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Submission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to add this teacher with {groups.length} group(s)?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmSubmit}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProtectedRoute(InsertTeacher);
>>>>>>> ef74eb1 (Initial commit with Next.js coworking space management app)
