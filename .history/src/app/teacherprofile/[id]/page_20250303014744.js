import { PanoramaSharp } from "@mui/icons-material";
import TeacherProfile from "../../../components/TeacherProfile";

const App = () => {
  const teacherId = PanoramaSharp.id; // Replace with the actual teacher ID

  return (
    <div>
      <h1>Teacher Profile</h1>
      <TeacherProfile teacherId={teacherId} />
    </div>
  );
};

export default App;