import React from "react";
import ClassroomCalendar from "../../../components/ClassroomCalendar";

const ClassroomPage = () => {
  const classroomId = 3; // Replace with the actual classroom ID

  return (
    <div>
      <h1>Classroom Schedule for class1</h1>
      <ClassroomCalendar classroomId={classroomId} />
    </div>
  );
};

export default ClassroomPage;