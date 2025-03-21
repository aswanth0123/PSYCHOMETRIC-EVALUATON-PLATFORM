import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import axios from "axios";
import TestCard from "./Testcard";
import {
  FaCheckCircle,
  FaClipboardList,
  FaCalendarAlt,
  FaCreditCard,
  FaCommentDots,
} from "react-icons/fa";
import "../styles/Dashboard.css";

const P_Dashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [result,setResult] = useState([])
  const [appoiments,setAppoiments] = useState([])
  const [testsData, setTestsData] = useState([]);
  const [payments, setPayments] = useState([]); 
  const [feedback, setFeedback] = useState([]);
  const [message, setMessage] = useState("");
  const [nextAppointmentDate, setNextAppointmentDate] = useState('');
  
  const [user, setUser] = useState({
    PSYCHOLOGIST_FIRST_NAME: "",
    PSYCHOLOGIST_LAST_NAME : "",
    PSYCHOLOGIST_EMAIL_ID: "",
    PSYCHOLOGIST_CONTACT_NO: "",
    PSYCHOLOGIST_CERTIFICATIONS : ""
  });

  const psychologist = JSON.parse(sessionStorage.getItem("psychologist"));
  console.log(psychologist.PSYCHOLOGIST_ID);
  

  const navigate = useNavigate();
  const fetchData = async () => {
    try {
      const [evaluations, tests, appointments, payments, feedback,psychologists] = await Promise.all([
        axios.get("http://localhost:5000/api/test-evaluations/"),
        axios.get("http://localhost:5000/api/tests/"),
        axios.get("http://localhost:5000/api/appointments/"),
        axios.get("http://localhost:5000/api/payments/"),
        axios.get("http://localhost:5000/api/feedback/"),
        axios.get(`http://localhost:5000/api/psychologist/${psychologist.PSYCHOLOGIST_ID}`),
      ]);

      setResult(evaluations.data);
      setTestsData(tests.data);
      setAppoiments(appointments.data);
      const upcomingAppointments = appointments.data.filter(app => new Date(app.TIME_SLOT) >= new Date());
      setNextAppointmentDate(
        upcomingAppointments.length ? new Date(upcomingAppointments[0].TIME_SLOT).toLocaleDateString() : 'No scheduled appointments'
      );
      setPayments(payments.data);
      setFeedback(feedback.data);
      setUser(psychologists.data);
      
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);



  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if(e.target.value.length<8){
      setMessage("Password should be at least 8 characters long.");
    }
    else{
      setMessage("Password oke");

      setUser({ ...user, PSYCHOLOGIST_PASSWORD: e.target.value });
    }
  }



  const handleSubmit = (e) => {
    e.preventDefault();

    axios.put(`http://localhost:5000/api/psychologist/${psychologist.PSYCHOLOGIST_ID}`, user)
      .then((response) => {
        setMessage("Profile updated successfully!");
      })
      .catch((error) => {
        setMessage("Error updating profile.");
        console.error("Update error:", error.message);
      });
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar with the new "Payments" & "Feedback" links */}
      <Sidebar setActiveSection={setActiveSection} />

      <div className="dashboard-main">
        {/* ========== Dashboard Section ========== */}
        {activeSection === "dashboard" && (
          <div className="dashboard-header">
            <div className="banner welcome-banner">
              <h1>
                Welcome, <span className="user-name">psychologist!</span> 👋
              </h1>
              <p>Your psychometric journey!</p>
            </div>
            <div className="dashboard-overview">
              <div className="overview-card">
                <FaClipboardList className="overview-icon" />
                <h3>{testsData.length} Tests Available</h3>
                <p>Start exploring now</p>
              </div>
              <div className="overview-card">
                <FaCheckCircle className="overview-icon" />
                <h3>{result.length}Test Completed Candidates</h3>
                <p>Select Reports to see</p>
              </div>
              <div className="overview-card">
                <FaCalendarAlt className="overview-icon" />
                <h3>Next Appointment</h3>
                <p>View details on Appointment</p>
              </div>
            </div>
          </div>
        )}

        {/* ========== Tests Section ========== */}
        {activeSection === "tests" && (
          <section className="tests-section">
            <div className="banner tests-banner">
              <h1>📋 My Tests</h1>
              <p>Explore and take tests to understand yourself better.</p>
            </div>
            <div className="card-list">
              {testsData.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          </section>
        )}

        {/* ========== Reports Section ========== */}
        {activeSection === "reports" && (
          <section className="reports">
            <div className="banner reports-banner">
              <h1>📑 My Results</h1>
              <p>View and analyze test results.</p>
            </div>
            <table className="table" width="100%" border="1">
                  <thead >
                    <tr>
                      <th>TEST NAME</th>
                      <th>Candidate Name</th>
                      <th>Score</th>
                      <th>Performance</th>                    </tr>
                  </thead>
                  <tbody>
                  {result.length > 0 ? (
                    result.map((item) => (
                      
                      <tr key={item.TEST_EVALUATION_ID}>
                        <th>{item.TEST_NAME}</th>
                        <th>{item.first_name} {item.last_name}</th>
                        <th>{item.TEST_EVALUATION 
                    ? item.TEST_EVALUATION.split(",")[0].replace("Score:", "").trim() 
                    : "No Score"}</th>
                            <th> {item.TEST_EVALUATION 
                    ? item.TEST_EVALUATION.split(",")[1].replace("Performance:", "").trim() 
                    : "No Performance"}</th>
                                          </tr>
                    ))
                  ) : (
                    <tr>
                      <th colSpan="4">No data available</th>
                    </tr>
                  )}
                  </tbody>
                </table>
              
          </section>
        )}

        {/* ========== Appointments Section ========== */}
        {activeSection === "appointments" && (
          <section className="appointments-section">
            <div className="appointments-banner">
              <h1>📅 Appointments</h1>
            </div>
            
            <table className="table" width="100%" border="1">
                  <thead>
                    <tr>
                      <th>APPOINTMENT_ID</th>
                      <th>CANDIDATE NAME</th>
                      <th>TEST NAME</th>
                      <th>TEST SCORE</th>
                      <th>TEST PERFORMANCE</th>
                      <th>TIME DATE</th>
                      <th>TIME TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                  {appoiments.length > 0 ? (
                    appoiments.map((item) => (
                      
                      <tr key={item.APPOINTMENT_ID}>
                        <th>{item.APPOINTMENT_ID}</th>

                        <th>{item.candidate_first_name}</th>
                        <th>{item.TEST_NAME}</th>
                        <th>{item.TEST_EVALUATION 
                    ? item.TEST_EVALUATION.split(",")[0].replace("Score:", "").trim() 
                    : "No Score"}</th>
                            <th> {item.TEST_EVALUATION 
                    ? item.TEST_EVALUATION.split(",")[1].replace("Performance:", "").trim() 
                    : "No Performance"}</th>                       
                     <th>{new Date(item.TIME_SLOT).toLocaleDateString()}</th>
                     <th>{new Date(item.TIME_SLOT).toLocaleTimeString()}</th>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <th colSpan="4">No data available</th>
                    </tr>
                  )}
                  </tbody>
                </table>
         
          </section>
        )}

        {/* ========== Payments Section ========== */}
        {activeSection === "payments" && (
          <section className="payments-section">
            <div className="banner payments-banner">
              <h1>
                <FaCreditCard /> Payments
              </h1>
              <p>Manage your transactions and view payment history.</p>
            </div>
            <table className="table" width="100%" border="1">
                  <thead>
                    <tr>
                      <th>PAYMENT ID</th>
                      <th>CANDIDATE NAME</th>
                      <th>APPOIMENT ID</th>
                      <th>PAYMENT METHOD</th>
                      <th>AMOUNT</th>
                      <th>DATE</th>
                      <th>TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                  {payments.length > 0 ? (
                    payments.map((item) => (
                      
                      <tr key={item.PAYMENT_ID}>
                        <th>{item.PAYMENT_ID}</th>

                        <th>{item.first_name}</th>
                        <th>{item.APPOINTMENT_ID}</th>
                        <th>{item.PAYMENT_METHOD}</th>
                        <th>{item.PAYMENT_AMOUNT}</th>
                        <th>{new Date(item.PAYMENT_DATE).toLocaleDateString()}</th>
                        <th>{new Date(item.PAYMENT_DATE).toLocaleTimeString()}</th>                      </tr>
                    ))
                  ) : (
                    <tr>
                      <th colSpan="6">No data available</th>
                    </tr>
                  )}
                  </tbody>
            </table>
          </section>
        )}

        {/* ========== Feedback Section ========== */}
        {activeSection === "feedback" && (
          <section className="feedback-section">
            <div className="banner feedback-banner">
              <h1>
                <FaCommentDots /> Feedback
              </h1>
              <p>We value your thoughts! Please share your feedback.</p>
            </div>
            <table className="table" width="100%" border="1">
                  <thead>
                    <tr>
                      <th>Feedback ID</th>
                      <th>Candidate NAME</th>
                      <th>Feedback</th>
             
                    </tr>
                  </thead>
                  <tbody>
                  {feedback.length > 0 ? (
                    feedback.map((item) => (
                      
                      <tr key={item.FEEDBACK_ID}>
                        <th>{item.FEEDBACK_ID}</th>

                        <th>{item.CANDIDATE_NAME}</th>
                        <th>{item.FEEDBACK}</th>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <th colSpan="3">No data available</th>
                    </tr>
                  )}
                  </tbody>
            </table>
          </section>
        )}

        {/* ========== Settings Section ========== */}
        {activeSection === "settings" && (
          <section className="feedback-section">
            <div className="banner feedback-banner">
              <h1>
              Profile
              </h1>
              <p>You can Update your Profile</p>
            </div>
            <div>
            {message && <p className="text-green-600 mb-4">{message}</p>}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block font-medium">First Name:</label>
                <input
                  type="text"
                  name="PSYCHOLOGIST_FIRST_NAME"
                  value={user.PSYCHOLOGIST_FIRST_NAME}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium">Last Name:</label>
                <input
                  type="text"
                  name="PSYCHOLOGIST_LAST_NAME"
                  value={user.PSYCHOLOGIST_LAST_NAME}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium">Email:</label>
                <input
                  type="email"
                  name="PSYCHOLOGIST_EMAIL_ID"
                  value={user.PSYCHOLOGIST_EMAIL_ID}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block font-medium">Phone:</label>
                <input
                  type="text"
                  name="PSYCHOLOGIST_CONTACT_NO"
                  value={user.PSYCHOLOGIST_CONTACT_NO}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium">CERTIFICATIONS:</label>
                <input
                  type="text"
                  name="PSYCHOLOGIST_CERTIFICATIONS"
                  value={user.PSYCHOLOGIST_CERTIFICATIONS}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
{/* 
              <div className="mb-4">
                <label className="block font-medium">Password:</label>
                <input
                  type="text"
                  name="PSYCHOLOGIST_PASSWORD"
                  value={password}
                  placeholder="if You want to update password Enter new Password here"
                  onChange={handlePasswordChange}
                  className="w-full p-2 border rounded"
                />
              </div> */}



              <button type="submit" className="test-btn">
                Update Profile
              </button>
            </form>
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default P_Dashboard;
