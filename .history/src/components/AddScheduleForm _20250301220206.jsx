'use client'
import { useState } from "react";

const AddScheduleForm = ({ classrooms = [], onAddSchedule }) => {
  const [schedule, setSchedule] = useState({
    classroomId: "",
    startTime: "",
    endTime: "",
    description: "",
    recurringWeekly: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSchedule((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!schedule.classroomId || !schedule.startTime || !schedule.endTime) {
      alert("Please fill all required fields!");
      return;
    }

    await onAddSchedule({
      ...schedule,
      classroomId: parseInt(schedule.classroomId, 10),
    });

    setSchedule({
      classroomId: "",
      startTime: "",
      endTime: "",
      description: "",
      recurringWeekly: false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card p-3 mb-4">
      <h4>Add New Schedule</h4>

      <div className="mb-3">
        <label className="form-label">Classroom</label>
        <select className="form-select" name="classroomId" value={schedule.classroomId} onChange={handleChange} required>
          <option value="">Select a Classroom</option>
          {classrooms.map((classroom) => (
            <option key={classroom.id} value={classroom.id}>
              {classroom.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Start Time</label>
        <input type="datetime-local" className="form-control" name="startTime" value={schedule.startTime} onChange={handleChange} required />
      </div>

      <div className="mb-3">
        <label className="form-label">End Time</label>
        <input type="datetime-local" className="form-control" name="endTime" value={schedule.endTime} onChange={handleChange} required />
      </div>

      <div className="mb-3">
        <label className="form-label">Description</label>
        <input type="text" className="form-control" name="description" value={schedule.description} onChange={handleChange} />
      </div>

      <div className="form-check mb-3">
        <input className="form-check-input" type="checkbox" name="recurringWeekly" checked={schedule.recurringWeekly} onChange={handleChange} />
        <label className="form-check-label">Recurring Weekly</label>
      </div>

      <button type="submit" className="btn btn-primary">Add Schedule</button>
    </form>
  );
};

export default AddScheduleForm;

