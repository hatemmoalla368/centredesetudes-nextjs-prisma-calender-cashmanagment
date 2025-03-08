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