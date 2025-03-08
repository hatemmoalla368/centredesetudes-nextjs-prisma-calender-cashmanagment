'use client'
import { useState } from "react";

const AddScheduleForm = ({ onClose, onAddSchedule }) => {
  const [newSchedule, setNewSchedule] = useState({
    classroomId: "",
    startTime: "",
    endTime: "",
    description: "",
    recurringWeekly: false, // Default to false
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewSchedule((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAddSchedule(newSchedule); // Call API function from AdminDashboard
    onClose(); // Close modal after submitting
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          {/* Modal Header */}
          <div className="modal-header">
            <h5 className="modal-title">Add New Schedule</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              {/* Classroom ID */}
              <div className="mb-3">
                <label className="form-label">Classroom</label>
                <select
                  className="form-select"
                  name="classroomId"
                  value={newSchedule.classroomId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a Classroom</option>
                  <option value="1">Classroom 1</option>
                  <option value="2">Classroom 2</option>
                  <option value="3">Classroom 3</option>
                </select>
              </div>

              {/* Start Time */}
              <div className="mb-3">
                <label className="form-label">Start Time</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  name="startTime"
                  value={newSchedule.startTime}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* End Time */}
              <div className="mb-3">
                <label className="form-label">End Time</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  name="endTime"
                  value={newSchedule.endTime}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-control"
                  name="description"
                  value={newSchedule.description}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Recurring Weekly Checkbox */}
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="recurringWeekly"
                  checked={newSchedule.recurringWeekly}
                  onChange={handleChange}
                />
                <label className="form-check-label">Recurring Weekly</label>
              </div>

              {/* Submit Button */}
              <div className="d-grid">
                <button type="submit" className="btn btn-primary">Add Schedule</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddScheduleForm;
