"use client"
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const AdminDashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    classroomId: '',
    startTime: '',
    endTime: '',
    description: '',
    recurringWeekly: false,
  });

  // Fetch schedules and classrooms when component mounts
  useEffect(() => {
    fetchSchedules();
    fetchClassrooms();
  }, []);

  // Function to fetch schedules from the API
  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/schedules');
      const data = await res.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  // Function to fetch classrooms from the API
  const fetchClassrooms = async () => {
    try {
      const res = await fetch('/api/classrooms');
      const data = await res.json();
      setClassrooms(data);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Admin Dashboard</h1>

      {/* Schedule List */}
      <h3>Schedules</h3>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Classroom</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Recurring Weekly</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell>{schedule.classroom.name}</TableCell>
                <TableCell>{new Date(schedule.startTime).toLocaleString()}</TableCell>
                <TableCell>{new Date(schedule.endTime).toLocaleString()}</TableCell>
                <TableCell>{schedule.description}</TableCell>
                <TableCell>{schedule.recurringWeekly ? 'Yes' : 'No'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add New Schedule Form (Optional) */}
      {/* You can keep the form to add new schedules, if needed. */}
    </div>
  );
};

export default AdminDashboard;
