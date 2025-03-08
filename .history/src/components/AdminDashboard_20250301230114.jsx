"use client"
import React, { useState, useEffect } from "react";

const AdminDashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0, // Initial page index
    pageSize: 10, // Initial page size
  });
  const [classrooms, setClassrooms] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    classroomId: "",
    startTime: "",
    endTime: "",
    description: "",
    recurringWeekly: false,
  });
  const [editSchedule, setEditSchedule] = useState(null);

  useEffect(() => {
    fetchSchedules();
    fetchClassrooms();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch("/api/schedules");
      const data = await response.json();
      setSchedules(data || []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  const fetchClassrooms = async () => {
    try {
      const response = await fetch("/api/classrooms");
      const data = await response.json();
      setClassrooms(data || []);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (editSchedule) {
      setEditSchedule({
        ...editSchedule,
        [name]: type === "checkbox" ? checked : value,
      });
    } else {
      setNewSchedule({
        ...newSchedule,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

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
        fetchSchedules();
        setNewSchedule({
          classroomId: "",
          startTime: "",
          endTime: "",
          description: "",
          recurringWeekly: false,
        });
      } else {
        console.error("Failed to add schedule");
      }
    } catch (error) {
      console.error("Error adding schedule:", error);
    }
  };

 

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchSchedules();
      } else {
        console.error("Failed to delete schedule");
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
  };
  const columns = useMemo(
    () => [
      {
        accessorKey: 'classroom.name',
        header: 'classroom',
        size: 100,
      },
      {
        accessorKey: "{new Date(schedule.startTime).toLocaleString()},
        header: 'Email',
        size: 100,
      },
      {
        accessorKey: 'numtel',
        header: 'Phone Number',
        size: 100,
      },
      {
        accessorKey: 'id',
        header: 'Actions',
        size: 100,
        Cell: ({ cell }) => (
          <div>
            <Button size="md" className="text-primary btn-link edit">
              <Link href={`/admin/auteurs/updateauteur/${cell.row.original.id}`}>
                <ModeEditIcon />
              </Link>
            </Button>
            <Button
              onClick={() => deleteauteur(cell.row.original.id)}
              variant="danger"
              size="md"
              className="text-danger btn-link delete"
            >
              <DeleteForeverIcon />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>

      {/* New Schedule Form */}
      <h3>Create a New Schedule</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="classroomId" className="form-label">Classroom</label>
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

        {/* Start Time */}
        <div className="mb-3">
          <label htmlFor="startTime" className="form-label">Start Time</label>
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
          <label htmlFor="endTime" className="form-label">End Time</label>
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
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            name="description"
            value={newSchedule.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        {/* Recurring Weekly */}
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
            <th scope="col">Actions</th>
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
              <td>
                
                <button
                  className="btn btn-danger ms-2"
                  onClick={() => handleDelete(schedule.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

     
      
    </div>
  );
};

export default AdminDashboard;
