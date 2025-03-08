'use client'
import { useEffect, useState } from 'react';
import ReactCalendar from 'react-calendar';

export default function AdminDashboard() {
  const [schedules, setSchedules] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    classroomId: 1,
    startTime: '',
    endTime: '',
    recurringWeekly: false,
  });

  useEffect(() => {
    // Fetch classrooms and schedules
    fetch('/api/classrooms')
      .then((res) => res.json())
      .then((data) => setClassrooms(data));

    fetch('/api/schedules')
      .then((res) => res.json())
      .then((data) => setSchedules(data));
  }, []);

  const handleAddSchedule = async () => {
    await fetch('/api/schedules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSchedule),
    });
    // Reload schedules after adding
    fetch('/api/schedules')
      .then((res) => res.json())
      .then((data) => setSchedules(data));
  };

  return (
    <div>
      <h1>Classroom Schedule Management</h1>
      <div>
        {/* Calendar view */}
        <ReactCalendar />
      </div>
      <div>
        <h2>Add New Schedule</h2>
        <select
          value={newSchedule.classroomId}
          onChange={(e) => setNewSchedule({ ...newSchedule, classroomId: e.target.value })}
        >
          {classrooms.map((classroom) => (
            <option key={classroom.id} value={classroom.id}>
              {classroom.name}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={newSchedule.startTime}
          onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
        />
        <input
          type="datetime-local"
          value={newSchedule.endTime}
          onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
        />
        <label>
          Recurring Weekly:
          <input
            type="checkbox"
            checked={newSchedule.recurringWeekly}
            onChange={(e) => setNewSchedule({ ...newSchedule, recurringWeekly: e.target.checked })}
          />
        </label>
        <button onClick={handleAddSchedule}>Add Schedule</button>
      </div>

      <h2>Current Schedules</h2>
      <table>
        <thead>
          <tr>
            <th>Classroom</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Recurring</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule.id}>
              <td>{schedule.classroom.name}</td>
              <td>{new Date(schedule.startTime).toLocaleString()}</td>
              <td>{new Date(schedule.endTime).toLocaleString()}</td>
              <td>{schedule.recurringWeekly ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
