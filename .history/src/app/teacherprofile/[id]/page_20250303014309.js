import TeacherProfile from "../../../components/TeacherProfile";

const App = () => {
  const teacherId = req; // Replace with the actual teacher ID

  return (
    <div>
      <h1>Teacher Profile</h1>
      <TeacherProfile teacherId={teacherId} />
    </div>
  );
};

export default App;