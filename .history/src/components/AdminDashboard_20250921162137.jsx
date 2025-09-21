"use client";
import React, { useState, useEffect, useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import Button from "react-bootstrap/Button";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditIcon from "@mui/icons-material/Edit";
import Modal from "react-bootstrap/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'next/navigation';
import { Container, Spinner } from "react-bootstrap";
import ProtectedRoute from "./ProtectedRoute";
import { DateTime } from "luxon";
const AdminDashboard = () => {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
const [editingSchedule, setEditingSchedule] = useState({
  id: "",
  classroomId: "",
  startTime: "",
  endTime: "",
  description: "",
  recurringWeekly: false,
  teacherId: "",
});
  const [schedules, setSchedules] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0, // Initial page index
    pageSize: 10, // Initial page size
  });
  const [classrooms, setClassrooms] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [newSchedule, setNewSchedule] = useState({
    classroomId: "",
    startTime: "",
    endTime: "",
    description: "",
    recurringWeekly: false,
    teacherId: "",
  });
const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    fetchSchedules();
    fetchClassrooms();
    fetchTeachers();
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

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/teachers");
      const data = await response.json();
      setTeachers(data || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewSchedule({
      ...newSchedule,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { classroomId, startTime, endTime, recurringWeekly } = newSchedule;
  
      // Validate that endTime is after startTime
      if (new Date(endTime) <= new Date(startTime)) {
        throw new Error("End time must be after start time.");
      }
  
      let schedulesToCreate = [];
  
      if (recurringWeekly) {
        const weeks = 5; // Number of weeks to create schedules for
  
        // Generate recurring schedules
        for (let i = 0; i < weeks; i++) {
          const newStartTime = new Date(startTime);
          const newEndTime = new Date(endTime);
  
          // Add 7 days for each iteration
          newStartTime.setDate(newStartTime.getDate() + i * 7);
          newEndTime.setDate(newEndTime.getDate() + i * 7);
  
          // Check for conflicts for each recurring schedule
          const conflictResponse = await fetch("/api/schedules/check-conflict", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              classroomId,
              startTime: newStartTime.toISOString(),
              endTime: newEndTime.toISOString(),
            }),
          });
  
          if (!conflictResponse.ok) {
            const conflictData = await conflictResponse.json();
            throw new Error(
              `Conflict detected for ${newStartTime.toLocaleString()} - ${newEndTime.toLocaleString()}: ${conflictData.error}`
            );
          }
  
          // Add the schedule to the list
          schedulesToCreate.push({
            ...newSchedule,
            startTime: newStartTime.toISOString(),
            endTime: newEndTime.toISOString(),
          });
        }
      } else {
        // For non-recurring schedules, check for conflicts for the single schedule
        const conflictResponse = await fetch("/api/schedules/check-conflict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            classroomId,
            startTime,
            endTime,
          }),
        });
  
        if (!conflictResponse.ok) {
          const conflictData = await conflictResponse.json();
          throw new Error(conflictData.error || "Classroom is already booked at the requested time.");
        }
  
        // Add the schedule to the list
        schedulesToCreate.push(newSchedule);
      }
  
      // Send all schedules to the backend
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schedules: schedulesToCreate,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to add schedules.");
      }
  
      // Refresh the schedules list and reset the form
      fetchSchedules();
      setNewSchedule({
        classroomId: "",
        startTime: "",
        endTime: "",
        description: "",
        recurringWeekly: false,
        teacherId: "",
      });
  
      toast.success("Schedule(s) added successfully!");
    } catch (error) {
      
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchSchedules();
        toast.success("Schedule deleted successfully!");
      } else {
        throw new Error("Failed to delete schedule.");
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error(error.message);
    }
  };

const handleEditClick = (schedule) => {
  const dateToLocalInput = (dateString) => {
    const date = new Date(dateString);
    // Format for datetime-local input (YYYY-MM-DDTHH:MM)
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}T${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  setEditingSchedule({
    ...schedule,
    startTime: dateToLocalInput(schedule.startTime),
    endTime: dateToLocalInput(schedule.endTime)
  });
  setShowEditModal(true);
};

const handleEditChange = (e) => {
  const { name, value, type, checked } = e.target;
  setEditingSchedule({
    ...editingSchedule,
    [name]: type === "checkbox" ? checked : value,
  });
};

const handleUpdateSchedule = async (e) => {
  e.preventDefault();
  try {
    const { classroomId, startTime, endTime } = editingSchedule;

    // Validate that endTime is after startTime
    if (new Date(endTime) <= new Date(startTime)) {
      throw new Error("End time must be after start time.");
    }

    // Check for conflicts (excluding the current schedule)
    const conflictResponse = await fetch("/api/schedules/check-conflict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        classroomId,
        startTime,
        endTime,
        excludeScheduleId: editingSchedule.id,
      }),
    });

    if (!conflictResponse.ok) {
      const conflictData = await conflictResponse.json();
      throw new Error(conflictData.error || "Classroom is already booked at the requested time.");
    }

    const response = await fetch(`/api/schedules/${editingSchedule.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editingSchedule),
    });

    if (!response.ok) {
      throw new Error("Failed to update schedule.");
    }

    fetchSchedules();
    setShowEditModal(false);
    toast.success("Schedule updated successfully!");
  } catch (error) {
    toast.error(error.message);
  }
};

  const columns = useMemo(
    () => [
      {
        accessorKey: "classroom.name", // Access nested property classroom.name
        header: "Classroom",
        size: 100,
      },
      {
        accessorKey: "teacher.name", // Access nested property classroom.name
        header: "teacher",
        size: 100,
      },
   {
        accessorKey: "startTime", // Assuming startTime is in ISO format
        header: "Start Time",
        size: 100,
        Cell: ({ cell }) => new Date(cell.row.original.startTime).toLocaleString(), // Format the date
      },
      {
        accessorKey: "endTime", // Assuming endTime is in ISO format
        header: "End Time",
        size: 100,
        Cell: ({ cell }) => new Date(cell.row.original.endTime).toLocaleString(),
      },
 
      {
        accessorKey: "description",
        header: "Description",
        size: 200,
      },
       {
      accessorKey: "id",
      header: "Actions",
      size: 100,
      Cell: ({ cell }) => (
        <div className="d-flex gap-2">
          <Button
            onClick={() => handleEditClick(cell.row.original)}
            variant="contained"
            color="primary"
            size="small"
            className="text-primary btn-link edit"
          >
            <EditIcon />
          </Button>
          <Button
            onClick={() => handleDelete(cell.row.original.id)}
            variant="contained"
            color="secondary"
            size="small"
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
        <div className="mb-3">
          <label htmlFor="teacherId" className="form-label">Teacher</label>
          <select
            className="form-select"
            name="teacherId"
            value={newSchedule.teacherId}
            onChange={handleChange}
            required
          >
            <option value="">Select a Teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
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
      <MaterialReactTable
        key={schedules.length} // Force re-render when data changes
        columns={columns}
        data={schedules}
        initialState={{ pagination }}
        onPaginationChange={(newPagination) => {
          console.log("Pagination Changed:", newPagination);
          setPagination(newPagination);
        }}
        state={{ pagination: pagination }} // Ensure controlled pagination state
        manualPagination={false} // Ensure the table handles pagination internally
      />
      {/* Edit Schedule Modal */}
<Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Edit Schedule</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <form onSubmit={handleUpdateSchedule}>
      <div className="mb-3">
        <label htmlFor="classroomId" className="form-label">Classroom</label>
        <select
          className="form-select"
          name="classroomId"
          value={editingSchedule.classroomId}
          onChange={handleEditChange}
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
        <label htmlFor="teacherId" className="form-label">Teacher</label>
        <select
          className="form-select"
          name="teacherId"
          value={editingSchedule.teacherId}
          onChange={handleEditChange}
          required
        >
          <option value="">Select a Teacher</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label htmlFor="startTime" className="form-label">Start Time</label>
        <input
  type="datetime-local"
  name="startTime"
  value={editingSchedule.startTime}
  onChange={handleEditChange}
  required
    step="900" // 15-minute intervals

/>
      </div>
      <div className="mb-3">
        <label htmlFor="endTime" className="form-label">End Time</label>
        <input
  type="datetime-local"
  name="endTime"
  value={editingSchedule.endTime}
  onChange={handleEditChange}
  required
    step="900" // 15-minute intervals

/>
      </div>
      <div className="mb-3">
        <label htmlFor="description" className="form-label">Description</label>
        <textarea
          className="form-control"
          name="description"
          value={editingSchedule.description}
          onChange={handleEditChange}
          required
        ></textarea>
      </div>
      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          name="recurringWeekly"
          checked={editingSchedule.recurringWeekly}
          onChange={handleEditChange}
        />
        <label className="form-check-label" htmlFor="recurringWeekly">
          Recurring Weekly
        </label>
      </div>
      <button type="submit" className="btn btn-primary">
        Update Schedule
      </button>
    </form>
  </Modal.Body>
</Modal>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default ProtectedRoute(AdminDashboard);