"use client"
import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Setup the localizer using moment
const localizer = momentLocalizer(moment);

const ClassroomCalendar = ({ classroomId }) => {
  const [schedules, setSchedules] = useState([]);

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
    title: schedule.teacher.name,
    desc : schedule.descriptdion,
    start: new Date(schedule.startTime),
    end: new Date(schedule.endTime),
    allDay: false, // Set to true if the event is all-day
  }));
  
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
        onSelectEvent={(event) => alert(`Selected: ${event.title, event.desc}`)}
      />
    </div>
  );
};

export default ClassroomCalendar;