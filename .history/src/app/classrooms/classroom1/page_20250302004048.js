import React from "react";
import ClassroomCalendar from "../../../components/";

const ClassroomPage = () => {
  const classroomId = 1; // Replace with the actual classroom ID

  return (
    <div>
      <h1>Classroom Schedule</h1>
      <ClassroomCalendar classroomId={classroomId} />
    </div>
  );
};

export default ClassroomPage;