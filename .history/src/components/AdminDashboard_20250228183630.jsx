'use client'
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AddScheduleForm from './'; // Assuming you have a form component for adding schedules

function AdminDashboard() {
  const [classrooms, setClassrooms] = useState([]); // Initialize as an empty array
  const [schedules, setSchedules] = useState([]);
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);

  useEffect(() => {
    // Fetch classrooms and schedules
    async function fetchData() {
      try {
        const classroomsResponse = await fetch('/api/classrooms');
        const classroomsData = await classroomsResponse.json();
        if (!classroomsResponse.ok) throw new Error('Failed to fetch classrooms');
        setClassrooms(classroomsData);

        const schedulesResponse = await fetch('/api/schedules');
        const schedulesData = await schedulesResponse.json();
        if (!schedulesResponse.ok) throw new Error('Failed to fetch schedules');
        setSchedules(schedulesData);
      } catch (error) {
        toast.error(error.message);
      }
    }

    fetchData();
  }, []);

  const handleAddSchedule = async (newSchedule) => {
    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSchedule),
      });

      if (!response.ok) {
        throw new Error('Failed to add schedule');
      }

      const addedSchedule = await response.json();
      setSchedules((prevSchedules) => [...prevSchedules, addedSchedule]);
      toast.success('Schedule added successfully');
      setIsAddingSchedule(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="container mt-5">
      <h1>Admin Dashboard</h1>

      {/* Display Classrooms */}
      <div className="mt-4">
        <h2>Classrooms</h2>
        <ul className="list-group">
          {classrooms && classrooms.length === 0 ? (
            <li className="list-group-item">No classrooms available.</li>
          ) : (
            classrooms.map((classroom) => (
              <li key={classroom.id} className="list-group-item">
                {classroom.name}
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Display Schedules */}
      <div className="mt-4">
        <h2>Schedules</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Classroom</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 ? (
              <tr>
                <td colSpan="4">No schedules available.</td>
              </tr>
            ) : (
              schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td>{schedule.classroom.name}</td>
                  <td>{new Date(schedule.startTime).toLocaleString()}</td>
                  <td>{new Date(schedule.endTime).toLocaleString()}</td>
                  <td>{schedule.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Schedule Form */}
      {isAddingSchedule && classrooms.length > 0 && (
        <div className="mt-4">
          <h2>Add Schedule</h2>
          <AddScheduleForm
            classrooms={classrooms}
            onAddSchedule={handleAddSchedule}
          />
        </div>
      )}

      {/* Toggle Add Schedule Form */}
      <button
        className="btn btn-primary mt-3"
        onClick={() => setIsAddingSchedule((prev) => !prev)}
      >
        {isAddingSchedule ? 'Cancel' : 'Add Schedule'}
      </button>
    </div>
  );
}

export default AdminDashboard;
