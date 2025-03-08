'use client'
import { useState } from 'react';

function AddScheduleForm({ classrooms, onAddSchedule }) {
  const [classroomId, setClassroomId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const newSchedule = {
      classroomId,
      startTime,
      endTime,
      description,
    };

    onAddSchedule(newSchedule);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="classroomId">Classroom</label>
        <select
          id="classroomId"
          className="form-control"
          value={classroomId}
          onChange={(e) => setClassroomId(e.target.value)}
        >
          <option value="">Select Classroom</option>
          {classrooms.length === 0 ? (
            <option value="">No classrooms available</option>
          ) : (
            classrooms.map((classroom) => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="startTime">Start Time</label>
        <input
          type="datetime-local"
          id="startTime"
          className="form-control"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="endTime">End Time</label>
        <input
          type="datetime-local"
          id="endTime"
          className="form-control"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <input
          type="text"
          id="description"
          className="form-control"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <button type="submit" className="btn btn-primary mt-3">
        Add Schedule
      </button>
    </form>
  );
}

export default AddScheduleForm;
