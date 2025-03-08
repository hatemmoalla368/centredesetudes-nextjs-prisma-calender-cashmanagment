"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // For navigation after submission

const AdminDashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [editSchedule, setEditSchedule] = useState(null); // Store the schedule to edit
  const [newSchedule, setNewSchedule] = useState({
    classroomId: '',
    startTime: '',
    endTime: '',
    description: '',
    recurringWeekly: false,
  });

  const router = useRouter();
  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/schedules');
      const data = await res.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchClassrooms = async () => {
    try {
      const res = await fetch('/api/classrooms');
      const data = await res.json();
      setClassrooms(data);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    }
  };
  // Fetch schedules and classrooms when component mounts
  useEffect(() => {
    

    fetchSchedules();
    fetchClassrooms();
  }, []);

  // Handle input change for both adding and editing schedules
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewSchedule((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle the form submission for adding a new schedule
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSchedule),
      });

      if (res.ok) {
        fetchSchedules();
        setNewSchedule({
          classroomId: '',
          startTime: '',
          endTime: '',
          description: '',
          recurringWeekly: false,
        });
      } else {
        console.error('Failed to add schedule');
      }
    } catch (error) {
      console.error('Error adding schedule:', error);
    }
  };

  // Handle the form submission for updating an existing schedule
  

  // Handle the edit button click to populate the form
  const handleEditClick = (schedule) => {
    setEditSchedule(schedule);
    setNewSchedule({
      classroomId: schedule.classroomId,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      description: schedule.description,
      recurringWeekly: schedule.recurringWeekly,
    });
  };

  // Handle deleting a schedule
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchSchedules(); // Refresh the schedule list
      } else {
        console.error('Failed to delete schedule');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Admin Dashboard</h1>

      {/* Schedule List */}
      <h3>Schedules</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Classroom</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Description</th>
            <th>Recurring Weekly</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule.id}>
              <td>{schedule.classroom.name}</td>
              <td>{new Date(schedule.startTime).toLocaleString()}</td>
              <td>{new Date(schedule.endTime).toLocaleString()}</td>
              <td>{schedule.description}</td>
              <td>{schedule.recurringWeekly ? 'Yes' : 'No'}</td>
              <td>
                <button onClick={() => handleEditClick(schedule)} className="btn btn-primary btn-sm">Edit</button>
                <button onClick={() => handleDelete(schedule.id)} className="btn btn-danger btn-sm ms-2">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      
    </div>
  );
};

export default AdminDashboard;
