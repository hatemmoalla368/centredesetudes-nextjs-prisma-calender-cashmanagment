"use client"
import React, { useEffect, useMemo, useState } from "react";
import { Card, Table, Alert, Spinner } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { MaterialReactTable } from 'material-react-table';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Button from 'react-bootstrap/Button';

const TeacherProfile = ({ teacherId }) => {
    const [pagination, setPagination] = useState({
        pageIndex: 0, // Initial page index
        pageSize: 10, // Initial page size
      });
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const fetchTeacherProfile = async () => {
    try {
      const response = await fetch(`/api/teachers/${teacherId}`);
      if (!response.ok) throw new Error("Failed to fetch profile");
      const data = await response.json();
      setTeacher(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to fetch profile.");
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    

    if (teacherId) {
      fetchTeacherProfile();
    }
  }, [teacherId]);
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchTeacherProfile();
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
        accessorKey: "classroom.name", // Access nested property classroom.name
        header: "Classroom",
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
        accessorKey: "id", // This is where we define the Actions column
        header: "Actions",
        size: 100,
        Cell: ({ cell }) => (
          <div>
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
  if (loading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!teacher) {
    return <Alert variant="warning">Teacher not found.</Alert>;
  }
  console.log("teacher", teacher)
  return (
    <div>
    <Card>
      <Card.Body>
        <Card.Title>Teacher Profile</Card.Title>
        <Card.Text>
          <strong>Name:</strong> {teacher.name}
          <br />
          <strong>Email:</strong> {teacher.email}
          <br />
          <strong>Phone:</strong> {teacher.phone || "N/A"}
        </Card.Text>

        <Card.Title>Booking History</Card.Title>
        
          
        
      </Card.Body>
    </Card>
    {teacher.schedules && teacher.schedules.length > 0 ? (
    <MaterialReactTable
        key={teacher.schedules.length} // Force re-render when data changes
        columns={columns}
        data={teacher.schedules}
        initialState={{ pagination }}
        onPaginationChange={(newPagination) => {
          console.log('Pagination Changed:', newPagination);
          setPagination(newPagination);
        }}
        state={{ pagination: pagination }} // Ensure controlled pagination state
        manualPagination={false} // Ensure the table handles pagination internally
      />
    ) : (
        <Alert variant="info">No schedules found for this teacher.</Alert>
      )}
    </div>
  );
};

export default TeacherProfile;
"use client"
import React, { useEffect, useMemo, useState } from "react";
import { Card, Alert, Spinner, Modal, Button as BootstrapButton, ListGroup } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { MaterialReactTable } from 'material-react-table';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Button from '@mui/material/Button';
import GroupsIcon from '@mui/icons-material/Groups';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";  // Note: This is the correct import for v4+
import EditIcon from "@mui/icons-material/Edit";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/contexts/AuthContext";

import ProtectedRoute from "./ProtectedRoute";

const TeacherProfile = ({ teacherId }) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [classrooms, setClassrooms] = useState([]);
    const [teachers, setTeachers] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showGroupsModal, setShowGroupsModal] = useState(false);
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
const [selectedGroup, setSelectedGroup] = useState(null);


 const exportGroupPDF = (group) => {
  if (!teacher || !group) return;

  const doc = new jsPDF({
    orientation: 'landscape'
  });

  // TEACHER INFO HEADER - Properly aligned
  doc.setFontSize(16);
  doc.text(`Teacher: ${teacher.name}`, 20, 20);
  
  doc.setFontSize(12);
  // Align all secondary info at same left margin (20)
  doc.text(`Email: ${teacher.email}`, 20, 30);
  doc.text(`Phone: ${teacher.phone || 'N/A'}`, 20, 40);
  doc.text(`Group: ${group.name}`, 20, 50);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);

  // Rest of your PDF generation code...
  const startY = 70; // Start table below header info
  
  const columnStyles = {
    0: { cellWidth: 40, halign: 'left' }, // Name
    1: { cellWidth: 30, halign: 'left' }  // Phone
  };
  
  // Add attendance columns
  for (let i = 2; i < 18; i++) {
    columnStyles[i] = { cellWidth: 15 };
  }

  // Table data with empty header row + students + empty rows
  const tableData = [
    ['', '', ...Array(16).fill('')], // Empty header
    ...(group.students?.map(student => [
      student.name,
      student.phone,
      ...Array(16).fill('')
    ]) || []),
    ...Array(15).fill(['', '', ...Array(16).fill('')]) // Empty rows
  ];

  autoTable(doc, {
    startY,
    body: tableData,
    styles: {
      fontSize: 10,
      cellPadding: 4,
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
      fillColor: [255, 255, 255],
      halign: 'center',
      valign: 'middle'
    },
    columnStyles,
    margin: { left: 20 },
    didDrawCell: (data) => {
      doc.setDrawColor(0, 0, 0);
      doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
    }
  });

  doc.save(`${teacher.name.replace(/\s+/g, '_')}_${group.name.replace(/\s+/g, '_')}_Attendance.pdf`);
};
  const fetchTeacherProfile = async () => {
    try {
      const response = await fetch(`/api/teachers/${teacherId}?includeGroups=true`);
      if (!response.ok) throw new Error("Failed to fetch profile");
      const data = await response.json();
      setTeacher(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to fetch profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherId) {
      fetchTeacherProfile();
    }
    fetchClassrooms();
    fetchTeachers();
  }, [teacherId]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchTeacherProfile();
      } else {
        console.error("Failed to delete schedule");
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
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

    fetchTeacherProfile();
    setShowEditModal(false);
    toast.success("Schedule updated successfully!");
  } catch (error) {
    toast.error(error.message);
  }
};
  const columns = useMemo(
    () => [
      {
        accessorKey: "classroom.name",
        header: "Classroom",
        size: 100,
      },
      {
        accessorKey: "startTime",
        header: "Start Time",
        size: 100,
        Cell: ({ cell }) => new Date(cell.row.original.startTime).toLocaleString(),
      },
      {
        accessorKey: "endTime",
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

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!teacher) {
    return <Alert variant="warning">Teacher not found.</Alert>;
  }

  return (
    <div>
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Card.Title>Teacher Profile</Card.Title>
              <Card.Text>
                <strong>Name:</strong> {teacher.name}
                <br />
                <strong>Email:</strong> {teacher.email}
                <br />
                <strong>Phone:</strong> {teacher.phone || "N/A"}
              </Card.Text>
            </div>
            {teacher.groups && teacher.groups.length > 0 && (
              <div>
              <Button
                variant="outlined"
                startIcon={<GroupsIcon />}
                onClick={() => setShowGroupsModal(true)}
              >
                View Groups ({teacher.groups.length})
              </Button>
                 
                </div>
            )}
          </div>

          <Card.Title className="mt-4">Booking History</Card.Title>
        </Card.Body>
      </Card>

      {teacher.schedules && teacher.schedules.length > 0 ? (
        <MaterialReactTable
          key={teacher.schedules.length}
          columns={columns}
          data={teacher.schedules}
          initialState={{ pagination }}
          onPaginationChange={(newPagination) => {
            console.log('Pagination Changed:', newPagination);
            setPagination(newPagination);
          }}
          state={{ pagination: pagination }}
          manualPagination={false}
        />
      ) : (
        <Alert variant="info">No schedules found for this teacher.</Alert>
      )}

      {/* Groups Modal */}
        <Modal show={showGroupsModal} onHide={() => setShowGroupsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{teacher?.name}'s Groups</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {teacher?.groups?.map(group => (
            <Card key={group.id} className="mb-3">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <strong>{group.name}</strong>
                <Button 
                  variant="outlined"
                  size="sm"
                  onClick={() => exportGroupPDF(group)}
                  startIcon={<PictureAsPdfIcon fontSize="small" />}
                >
                  Export PDF
                </Button>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {group.students?.map(student => (
                    <ListGroup.Item key={student.id}>
                      {student.name} - {student.phone}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          ))}
        </Modal.Body>
      </Modal>
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
    </div>
  );
};

export default ProtectedRoute(TeacherProfile);