"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Row,
  Col,
  Modal,
} from "react-bootstrap";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const EditTeacher = () => {
  const { id } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/teachers/${id}?includeGroups=true`);
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        
        setFormData({
          name: data.name,
          email: data.email,
          phone: data.phone || "",
        });
        
        setGroups(
          data.groups?.map((group) => ({
            id: group.id,
            name: group.name,
            students: group.students?.map((student) => ({
              id: student.id,
              name: student.name,
              phone: student.phone,
            })) || [{ name: "", phone: "" }],
          })) || []
        );
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setSaving(true);
    setShowConfirm(false);

    const payload = {
      ...formData,
      groups: groups.map((group) => ({
        id: group.id || undefined,
        name: group.name,
        students: group.students.map((student) => ({
          id: student.id || undefined,
          name: student.name,
          phone: student.phone,
        })),
      })),
    };

    try {
      const response = await fetch(`/api/teachers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update");

      router.push("/teacher");
    } catch (err) {
      console.error(err);
      setError("Failed to update. Try again.");
    } finally {
      setSaving(false);
    }
  };

  

  return (
    <>
      <Card>
        <Card.Body>
          <Card.Title>Edit Teacher</Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Form.Group>

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

            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to update this teacher with {groups.length}{" "}
          group(s)?
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

export default ProtectedRoute(EditTeacher);