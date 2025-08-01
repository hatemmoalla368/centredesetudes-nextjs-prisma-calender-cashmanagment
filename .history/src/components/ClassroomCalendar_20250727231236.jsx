"use client"
import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'next/navigation';
import ProtectedRoute from "./ProtectedRoute";

// Setup the localizer using moment
const localizer = momentLocalizer(moment);

const ClassroomCalendar = ({ classroomId }) => {
  const router = useRouter();
  const [schedules, setSchedules] = useState([]);
const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch schedules for the specific classroom
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch(`/api/schedules/${classroomId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch schedules");
        }
        const data = await response.json();
        setSchedules(data);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };

    fetchSchedules();
  }, [classroomId]);

  // Format schedules for the calendar
  const events = schedules.map((schedule) => ({
    id: schedule.id,
    title: `${schedule.teacher.name} - ${schedule.description}`, // Combine teacher name and description
    start: new Date(schedule.startTime),
    end: new Date(schedule.endTime),
    allDay: false, // Set to true if the event is all-day
  }));
   // Customize event styles
   const eventPropGetter = (event) => {
    return {
      style: {
        backgroundColor: "#3174ad", // Custom background color
        color: "#fff", // Custom text color
        borderRadius: "5px", // Rounded corners
        border: "none", // Remove default border
      },
    };
  };

  // Customize event component
  const EventComponent = ({ event }) => {
    return (
      <div>
        <strong>{event.title}</strong>
        <br />
        <small>{event.desc}</small>
      </div>
    );
  };
  



console.log("schedules", schedules)
  return (
    <div style={{ height: "500px" }}>
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      defaultView="month"
      views={["month", "week", "day"]}
      onSelectEvent={(event) => alert(`Selected: ${event.title}`)}
      eventPropGetter={eventPropGetter} // Apply custom styles
      components={{
        event: EventComponent, // Use custom event component
      }}
    />
  </div>
  );
};

export default ClassroomCalendar);