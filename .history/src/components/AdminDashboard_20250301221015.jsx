import React, { useState, useEffect } from "react";

const AdminDashboard = () => {
  // State for schedules and classroom options
  const [schedules, setSchedules] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    classroomId: "",
    startTime: "",
    endTime: "",
    description: "",
    recurringWeekly: false, // Added recurringWeekly option
  });

  // Fetch schedules and classrooms when the component mounts
  useEffect(() => {
    fetchSchedules();
    fetchClassrooms();
  }, []);

  // Fetch schedules from API
  const fetchSchedules = async () => {
    try {
      const response = await fetch("/api/schedules");
      const data = await response.json();
      setSchedules(data || []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  // Fetch classrooms from API
  const fetchClassrooms = async () => {
    try {
      const response = await fetch("/api/classrooms");
      const data = await response.json();
      setClassrooms(data || []);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewSchedule({
      ...newSchedule,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle schedule form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSchedule),
      });
      if (response.ok) {
        fetchSchedules(); // Reload schedules
        setNewSchedule({
          classroomId: "",
          startTime: "",
          endTime: "",
          description: "",
          recurringWeekly: false,
        }); // Reset form
      } else {
        console.error("Failed to add schedule");
      }
    } catch (error) {
      console.error("Error adding schedule:", error);
    }
  };

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      
      {/* Add Schedule Form */}
      <h3>Create a New Schedule</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="classroomId" className="form-label">
            Classroom
          </label>
          <select
            className="form-select"
            name="classroomId"
            value={newSchedule.classroomId}
            onChange={handleChange}
            required
          >
            <option value="">Select a Classroom</option>
            {classrooms.map((classroom) => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="startTime" className="form-label">
            Start Time
          </label>
          <input
            type="datetime-local"
            className="form-control"
            name="startTime"
            value={newSchedule.startTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="endTime" className="form-label">
            End Time
          </label>
          <input
            type="datetime-local"
            className="form-control"
            name="endTime"
            value={newSchedule.endTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            className="form-control"
            name="description"
            value={newSchedule.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            name="recurringWeekly"
            checked={newSchedule.recurringWeekly}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="recurringWeekly">
            Recurring Weekly
          </label>
        </div>

        <button type="submit" className="btn btn-primary">
          Add Schedule
        </button>
      </form>

      {/* Schedule List */}
      <h3>Schedule List</h3>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Classroom</th>
            <th scope="col">Start Time</th>
            <th scope="col">End Time</th>
            <th scope="col">Description</th>
            <th scope="col">Recurring Weekly</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule.id}>
              <td>{schedule.classroom.name}</td>
              <td>{new Date(schedule.startTime).toLocaleString()}</td>
              <td>{new Date(schedule.endTime).toLocaleString()}</td>
              <td>{schedule.description}</td>
              <td>{schedule.recurringWeekly ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
