'use client'
import { useEffect, useState } from "react";
import AddScheduleForm from "./AddScheduleForm ";

const AdminDashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [classrooms, setClassrooms] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch("/api/schedules");
        if (!response.ok) throw new Error("Failed to fetch schedules");
        const data = await response.json();
        setSchedules(data);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };

    const fetchClassrooms = async () => {
      try {
        const response = await fetch("/api/classrooms");
        if (!response.ok) throw new Error("Failed to fetch classrooms");
        const data = await response.json();
        setClassrooms(data);
      } catch (error) {
        console.error("Error fetching classrooms:", error);
      }
    };

    fetchSchedules();
    fetchClassrooms();
  }, []);

  const handleAddSchedule = async (scheduleData) => {
    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) throw new Error("Failed to add schedule");

      const newSchedule = await response.json();
      setSchedules((prev) => [...prev, newSchedule]);
    } catch (error) {
      console.error("Error adding schedule:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Admin Dashboard</h2>

      <AddScheduleForm classrooms={classrooms || []} onAddSchedule={handleAddSchedule} />

      <h3 className="mt-4">Schedules</h3>
      <table className="table table-bordered">
        <thead>
          <tr>
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
