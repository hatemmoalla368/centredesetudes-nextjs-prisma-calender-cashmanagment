"use client"
import React, { useEffect, useMemo, useState } from "react";
import { Card, Table, Alert, Spinner } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { MaterialReactTable } from 'material-react-table';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const TeacherProfile = ({ teacherId }) => {
    const [pagination, setPagination] = useState({
        pageIndex: 0, // Initial page index
        pageSize: 10, // Initial page size
      });
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
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

    if (teacherId) {
      fetchTeacherProfile();
    }
  }, [teacherId]);

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!teacher) {
    return <Alert variant="warning">Teacher not found.</Alert>;
  }
  const columns = useMemo(
    () => [
      {
        accessorKey: "schedule.classroom.name", // Access nested property classroom.name
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
        {teacher.schedules && teacher.schedules.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Classroom</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {teacher.schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td>{schedule.classroom?.name || "N/A"}</td>
                  <td>{new Date(schedule.startTime).toLocaleString()}</td>
                  <td>{new Date(schedule.endTime).toLocaleString()}</td>
                  <td>{schedule.description}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <Alert variant="info">No schedules found for this teacher.</Alert>
        )}
      </Card.Body>
    </Card>
    <MaterialReactTable
        key={teacher.length} // Force re-render when data changes
        columns={columns}
        data={teacher}
        initialState={{ pagination }}
        onPaginationChange={(newPagination) => {
          console.log('Pagination Changed:', newPagination);
          setPagination(newPagination);
        }}
        state={{ pagination: pagination }} // Ensure controlled pagination state
        manualPagination={false} // Ensure the table handles pagination internally
      />
    </div>
  );
};

export default TeacherProfile;