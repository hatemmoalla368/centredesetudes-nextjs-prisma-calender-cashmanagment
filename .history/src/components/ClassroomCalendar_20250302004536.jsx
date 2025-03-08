""
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
        const response = await fetch(`/api/schedules?classroomId=${classroomId}`);
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
    title: schedule.description,
    start: new Date(schedule.startTime),
    end: new Date(schedule.endTime),
    allDay: false, // Set to true if the event is all-day
  }));

  // 1. Event Styling
  const eventStyleGetter = (event) => {
    const backgroundColor = "#3174ad"; // Customize the background color
    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        color: "white",
      },
    };
  };

  // 2. Toolbar Customization
  const CustomToolbar = (toolbar) => {
    const goToToday = () => {
      toolbar.onNavigate("TODAY");
    };

    return (
      <div>
        <button onClick={goToToday}>Today</button>
        <button onClick={() => toolbar.onView("month")}>Month</button>
        <button onClick={() => toolbar.onView("week")}>Week</button>
        <button onClick={() => toolbar.onView("day")}>Day</button>
      </div>
    );
  };

  // 3. Localization (Optional)
  // Uncomment the following lines if you want to use a specific locale
  // import "moment/locale/fr"; // French locale
  // moment.locale("fr");

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
        eventPropGetter={eventStyleGetter} // Apply event styling
        components={{
          toolbar: CustomToolbar, // Apply custom toolbar
        }}
      />
    </div>
  );
};

export default ClassroomCalendar;