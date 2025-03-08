'use client'
import { useState, useEffect } from "react";
import AddScheduleForm from "./AddScheduleForm";

const AdminDashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Fetch schedules when component mounts
    const fetchSchedules = async () => {
      try {
        const response = await fetch("/api/schedules");
        const data = await response.json();
        setSchedules(data);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };

    fetchSchedules();
  }, []);

  // Function to add a new schedule
  const addSchedule = async (scheduleData) => {
    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) throw new Error("Failed to add schedule");

      const newSchedule = await response.json();
      setSchedules([...schedules, newSchedule]); // Update UI
    } catch (error) {
      console.error("Error adding schedule:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Admin Dashboard</h2>

      {/* Add Schedule Button */}
      <button className="btn btn-success mb-3" onClick={() => setShowModal(true)}>
        Add Schedule
      </button>

      {/* Schedule Table */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Classroom</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Description</th>
            <th>Recurring</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule.id}>
              <td>{schedule.id}</td>
              <td>{schedule.classroomId}</td>
              <td>{new Date(schedule.startTime).toLocaleString()}</td>
              <td>{new Date(schedule.endTime).toLocaleString()}</td>
              <td>{schedule.description}</td>
              <td>{schedule.recurringWeekly ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Schedule Modal */}
      {showModal && <AddScheduleForm onClose={() => setShowModal(false)} onAddSchedule={addSchedule} />}
    </div>
  );
};

export default AdminDashboard;
