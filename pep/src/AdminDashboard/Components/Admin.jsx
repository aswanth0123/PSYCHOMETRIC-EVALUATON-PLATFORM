import "./AdminDashboard.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const AdminDashboard = () => {
  const [psychologists, setPsychologists] = useState([]);
  const [tests, setTests] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();

  }, []);
    const fetchData = async () => {
      try {
        const [psychologistsRes, testsRes, evaluationsRes, appointmentsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/psychologists"),
          axios.get("http://localhost:5000/api/tests"),
          axios.get("http://localhost:5000/api/test-evaluations"),
          axios.get("http://localhost:5000/api/appointments"),
        ]);

        setPsychologists(psychologistsRes.data);
        setTests(testsRes.data);
        setEvaluations(evaluationsRes.data);
        setAppointments(appointmentsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    

  const questionload = (testid) => {
    navigate("/addquestion?testid=" + testid);
  }

  const addtest =()=>{
    let a = prompt("Enter Test Name");
    let b = prompt("Enter Test Descreption");
    axios.post("http://localhost:5000/api/tests",{
      TEST_NAME:a,
      TEST_DESCRIPTION:b
    })
    fetchData();
  }

  const deleteTest = (testid) => {
    axios.delete(`http://localhost:5000/api/tests/${testid}`)
    fetchData();
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <div>
      <header>
        <h1>Admin Dashboard - Psycologist</h1>
      </header>

      <nav>
        <a href="#manage-test">Test Details</a>
        <a href="#manage-appointment">Appoiment Details</a>
        <a href="#manage-doctors">Doctors List</a>
        <a href="#manage-evaluvation">Evaluvation Details</a>
        <a href="#settings">Settings</a>
      </nav>

      <div className="container1">
        {/* Order Section */}
        <div className="section" id="manage-test">
          
          <h2>Manage Tests <button className="btn1" onClick={addtest}>Add Test</button> </h2>
          <table className="table">
            <thead>
              <tr>
                <th>Test ID</th>
                <th>Test Name</th>
                <th>DESCRIPTION</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {tests.map(test => (
              <tr key={test.TEST_ID}>
                <td>{test.TEST_ID}</td>
                <td>{test.TEST_NAME}</td>
                <td>{test.TEST_DESCRIPTION}</td>
                <td id="tdbtn">
                  <button className="btn1" onClick={() => questionload(test.TEST_ID)}>Manage</button>
                  <button className="btn1" onClick={() => deleteTest(test.TEST_ID)} >Delete</button>
                </td>
              </tr>

            ))}

            </tbody>
          </table>
        </div>

        {/* Product Management Section */}
        <div className="section" id="manage-appointment">
          <h2>Appoiments</h2>

          <table className="table">
            <thead>
              <tr>
                        <th>ID</th>
                        <th>Candidate Name</th>
                        <th>Contact</th>
                        <th>Email</th>
                        <th>Psychologist Name</th>
                        <th>Test Name</th>
                        <th>Evaluation</th>
                        <th>Time</th>
                      </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                        <tr key={appointment.APPOINTMENT_ID}>
                            <td>{appointment.APPOINTMENT_ID}</td>
                            <td>{appointment.candidate_first_name} {appointment.candidate_last_name}</td>
                            <td>{appointment.candidate_phone}</td>
                            <td>{appointment.candidate_email}</td>
                            <td>{appointment.psychologist_first_name} {appointment.psychologist_last_name}</td>
                            <td>{appointment.TEST_NAME}</td>
                            <td>{appointment.TEST_EVALUATION}</td>
                            <td>{new Date(appointment.TIME_SLOT).toLocaleString()}</td>
                        </tr>
                    ))}
            </tbody>
          </table>
        </div>
        <div className="section" id="manage-doctors">
          <h2>Psychologist Details</h2>

          <table className="table">
            <thead>
              <tr>
              <th>ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>DOB</th>
                <th>Gender</th>
                <th>Contact No</th>
                <th>Email</th>
                <th>Certifications</th>
              </tr>
            </thead>
            <tbody>
              {psychologists.map((psychologist) => (
                <tr key={psychologist.PSYCHOLOGIST_ID}>
                  <td>{psychologist.PSYCHOLOGIST_ID}</td>
                  <td>{psychologist.PSYCHOLOGIST_FIRST_NAME}</td>
                  <td>{psychologist.PSYCHOLOGIST_LAST_NAME}</td>
                  <td>{psychologist.PSYCHOLOGIST_DOB}</td>
                  <td>{psychologist.PSYCHOLOGIST_GENDER}</td>
                  <td>{psychologist.PSYCHOLOGIST_CONTACT_NO}</td>
                  <td>{psychologist.PSYCHOLOGIST_EMAIL_ID}</td>
                  <td>{psychologist.PSYCHOLOGIST_CERTIFICATIONS}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="section" id="manage-evaluvation">
          <h2>Psychologist Details</h2>

          <table className="table">
            <thead>
              <tr>
                <th>Evaluation ID</th>
                <th>Candidate Name</th>
                <th>Test Name</th>
                <th>Score</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
            {evaluations.length > 0 ? (
              evaluations.map((evalItem) => {
                // Splitting evaluation details
                const [score, performance] = evalItem.TEST_EVALUATION.split(", Performance: ");
                return (
                  <tr key={evalItem.TEST_EVALUATION_ID}>
                    <td>{evalItem.TEST_EVALUATION_ID}</td>
                    <td>{evalItem.first_name} {evalItem.last_name}</td>
                    <td>{evalItem.TEST_NAME}</td>
                    <td>{score.replace("Score: ", "")}</td>
                    <td>{performance}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5">No evaluations found.</td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
        {/* Settings Section */}
        <div className="section" id="settings">
          <h2>Settings</h2>
          <p>Update your account settings, manage notifications, and customize the dashboard.</p>
          <button onClick={handleLogout} className="btn1">Logout</button>
          
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;