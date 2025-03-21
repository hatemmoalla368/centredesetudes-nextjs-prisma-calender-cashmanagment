"use client"
import React, { useEffect, useState } from "react";
import { Card, Table, Alert, Spinner } from "react-bootstrap";
import { useRouter } from "next/navigation";

const TeacherProfile = ({ teacherId }) => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const response = await fetch(`/api/teachers/${teacherId}`);
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        setTeacher(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to fetch profile.");
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) {
      fetchTeacherProfile();
    }
  }, [teacherId]);

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!teacher) {
    return <Alert variant="warning">Teacher not found.</Alert>;
  }
console.log("teacher", teacher)
  return (
    <Card>
      <Card.Body>
        <Card.Title>Teacher Profile</Card.Title>
        <Card.Text>
          <strong>Name:</strong> {teacher.name}
          <br />
          <strong>Email:</strong> {teacher.email}
          <br />
          <strong>Phone:</strong> {teacher.phone || "N/A"}
        </Card.Text>

        <Card.Title>Booking History</Card.Title>
        {teacher.schedules && teacher.schedules.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Classroom</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {teacher.schedules.map((schedule) => (
                <tr key={schedule.id}>
                    {schedule.classroomsId.map((classroom)=>
                    
                  <td>{classroom.name || "N/A"}</td>
                )}
                  <td>{new Date(schedule.startTime).toLocaleString()}</td>
                  <td>{new Date(schedule.endTime).toLocaleString()}</td>
                  <td>{schedule.description}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <Alert variant="info">No schedules found for this teacher.</Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default TeacherProfile;