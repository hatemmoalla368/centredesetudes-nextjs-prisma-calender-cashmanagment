"use client"
"import { useEffect, useState } from 'react'
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const [classrooms, setClassrooms] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    classroomId: '',
    startTime: '',
    endTime: '',
    recurringWeekly: false,
  });

  // Fetch classrooms
  useEffect(() => {
    fetch('/api/classrooms')
      .then((res) => res.json())
      .then((data) => setClassrooms(data))
      .catch((error) => {
        console.error('Error fetching classrooms:', error);
        toast.error('Error fetching classrooms');
      });
  }, []);

  // Fetch schedules
  useEffect(() => {
    fetch('/api/schedules')
      .then((res) => res.json())
      .then((data) => setSchedules(data))
      .catch((error) => {
        console.error('Error fetching schedules:', error);
        toast.error('Error fetching schedules');
      });
  }, []);

  // Handle new schedule submission
  const handleSubmitSchedule = async (e) => {
    e.preventDefault();

    const { classroomId, startTime, endTime, recurringWeekly } = newSchedule;
    if (!classroomId || !startTime || !endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ classroomId, startTime, endTime, recurringWeekly }),
      });

      if (!response.ok) {
        throw new Error('Error adding schedule');
      }

      const newSchedule = await response.json();
      setSchedules((prevSchedules) => [...prevSchedules, newSchedule]);
      toast.success('Schedule added successfully!');
      setNewSchedule({ classroomId: '', startTime: '', endTime: '', recurringWeekly: false });
    } catch (error) {
      console.error('Error adding schedule:', error);
      toast.error('Error adding schedule');
    }
  };

  return (
    <div className="container my-4">
      <h2 className="text-center">Admin Dashboard</h2>

      {/* Create a new schedule */}
      <div className="card mt-4">
        <div className="card-header">Add New Schedule</div>
        <div className="card-body">
          <form onSubmit={handleSubmitSchedule}>
            <div className="mb-3">
              <label htmlFor="classroomId" className="form-label">Classroom</label>
              <select
                id="classroomId"
                className="form-control"
                value={newSchedule.classroomId}
                onChange={(e) => setNewSchedule({ ...newSchedule, classroomId: e.target.value })}
              >
                <option value="">Select Classroom</option>
                {classrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="startTime" className="form-label">Start Time</label>
              <input
                type="datetime-local"
                id="startTime"
                className="form-control"
                value={newSchedule.startTime}
                onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="endTime" className="form-label">End Time</label>
              <input
                type="datetime-local"
                id="endTime"
                className="form-control"
                value={newSchedule.endTime}
                onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
              />
            </div>

            <div className="mb-3 form-check">
              <input
                type="checkbox"
                id="recurringWeekly"
                className="form-check-input"
                checked={newSchedule.recurringWeekly}
                onChange={(e) => setNewSchedule({ ...newSchedule, recurringWeekly: e.target.checked })}
              />
              <label htmlFor="recurringWeekly" className="form-check-label">
                Recurring Weekly
              </label>
            </div>

            <button type="submit" className="btn btn-primary">Add Schedule</button>
          </form>
        </div>
      </div>

      {/* View Schedules */}
      <div className="card mt-4">
        <div className="card-header">Classroom Schedules</div>
        <div className="card-body">
          {schedules.length === 0 ? (
            <p>No schedules found</p>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">Classroom</th>
                  <th scope="col">Start Time</th>
                  <th scope="col">End Time</th>
                  <th scope="col">Recurring</th>
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
          )}
        </div>
      </div>
    </div>
  );
}
