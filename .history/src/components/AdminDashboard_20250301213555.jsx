'use client'
// components/AdminDashboard.js
import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form } from 'react-bootstrap';

const AdminDashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [classrooms, setClassrooms] = useState([]); // To hold classroom data
  const [newSchedule, setNewSchedule] = useState({
    classroomId: '',
    startTime: '',
    endTime: '',
    description: '',
  });

  useEffect(() => {
    // Fetch schedules and classrooms when component mounts
    const fetchSchedules = async () => {
      try {
        const response = await fetch('/api/schedules');
        const data = await response.json();
        setSchedules(data);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };

    const fetchClassrooms = async () => {
      try {
        const response = await fetch('/api/classrooms'); // Assuming you have an API for classrooms
        const data = await response.json();
        setClassrooms(data);
      } catch (error) {
        console.error('Error fetching classrooms:', error);
      }
    };

    fetchSchedules();
    fetchClassrooms();
  }, []);

  const addSchedule = async (scheduleData) => {
    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduleData),
      });
  
      if (!response.ok) throw new Error("Failed to add schedule");
  
      const newSchedule = await response.json();
      setSchedules((prev) => [...prev, newSchedule]); // Update state
    } catch (error) {
      console.error("Error adding schedule:", error);
    }
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSchedule((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div className="container mt-4">
      <h1>Admin Dashboard</h1>
      <Button variant="primary" onClick={() => setShowModal(true)}>
        Add Schedule
      </Button>
      
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Classroom</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule.id}>
              <td>{schedule.classroom.name}</td> {/* Assuming classroom data is included */}
              <td>{new Date(schedule.startTime).toLocaleString()}</td>
              <td>{new Date(schedule.endTime).toLocaleString()}</td>
              <td>{schedule.description}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for Adding New Schedule */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Schedule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="classroomId">
              <Form.Label>Classroom</Form.Label>
              <Form.Control
                as="select"
                name="classroomId"
                value={newSchedule.classroomId}
                onChange={handleInputChange}
              >
                <option value="">Select Classroom</option>
                {classrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="startTime">
              <Form.Label>Start Time</Form.Label>
              <Form.Control
                type="datetime-local"
                name="startTime"
                value={newSchedule.startTime}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="endTime">
              <Form.Label>End Time</Form.Label>
              <Form.Control
                type="datetime-local"
                name="endTime"
                value={newSchedule.endTime}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={newSchedule.description}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddSchedule}>
            Add Schedule
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
