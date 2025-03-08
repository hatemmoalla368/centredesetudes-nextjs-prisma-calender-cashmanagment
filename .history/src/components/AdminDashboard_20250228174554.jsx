import { useEffect, useState } from 'react';
import ReactCalendar from 'react-calendar';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    classroomId: 1,
    startTime: '',
    endTime: '',
    recurringWeekly: false,
  });

  useEffect(() => {
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
    })
      .then((response) => response.json())
      .then(() => {
        toast.success('Schedule added successfully!');
        // Reload schedules after adding
        fetch('/api/schedules')
          .then((res) => res.json())
          .then((data) => setSchedules(data));
      })
      .catch(() => toast.error('Error adding schedule'));
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Classroom Schedule Management</h1>

      <div className="row">
        {/* Calendar view */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Calendar View</h5>
              <ReactCalendar />
            </div>
          </div>
        </div>

        {/* Schedule Management Form */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Add New Schedule</h5>

              <div className="mb-3">
                <label htmlFor="classroom" className="form-label">
                  Select Classroom
                </label>
                <select
                  id="classroom"
                  value={newSchedule.classroomId}
                  onChange={(e) => setNewSchedule({ ...newSchedule, classroomId: e.target.value })}
                  className="form-select"
                >
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
                  id="startTime"
                  value={newSchedule.startTime}
                  onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="endTime" className="form-label">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  id="endTime"
                  value={newSchedule.endTime}
                  onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  id="recurringWeekly"
                  checked={newSchedule.recurringWeekly}
                  onChange={(e) => setNewSchedule({ ...newSchedule, recurringWeekly: e.target.checked })}
                  className="form-check-input"
                />
                <label htmlFor="recurringWeekly" className="form-check-label">
                  Recurring Weekly
                </label>
              </div>

              <button onClick={handleAddSchedule} className="btn btn-primary">
                Add Schedule
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Schedules Table */}
      <h2 className="mt-4">Current Schedules</h2>
      <table className="table table-bordered mt-3">
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
    </div>
  );
};

export default AdminDashboard;
