import TeacherProfile from "../../../components/TeacherProfile";

const TeacherProfilePage = ({ params }) => {
  return (
    <div className="container mt-4">
      <h1>Teacher Profile</h1>
      <TeacherProfile teacherId={params.id} />
    </div>
  );
};

export default TeacherProfilePage;