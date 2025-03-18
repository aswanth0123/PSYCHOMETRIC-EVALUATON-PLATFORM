import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TestCard from "./Testcard";
import axios from 'axios'
import {
  FaCheckCircle,
  FaClipboardList,
  FaCalendarAlt,
  FaCreditCard,
  FaCommentDots,
} from "react-icons/fa";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [result,setResult] = useState([])
  const [appoiments,setAppoiments] = useState([])
  const navigate = useNavigate();
  const [testsData, setTestsData] = useState([]);
  const loggedInUser = JSON.parse(sessionStorage.getItem("user"));
  const [payments, setPayments] = useState([]);
  const [nextAppointmentDate, setNextAppointmentDate] = useState('');
  const [feedback, setFeedback] = useState([]); 
  
  const candidateId = loggedInUser.id;
  const [user, setUser] = useState({
    first_name: "",
    last_name : "",
    email: "",
    contact_number: "",
    gender: "",
    password: ""
  });
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    console.log('data getting');
    
    try {
      const [evaluationsRes, appointmentsRes, testsRes, paymentsRes, feedbackRes] = await Promise.all([
        axios.get("http://localhost:5000/api/test-evaluations/"),
        axios.get("http://localhost:5000/api/appointments/"),
        axios.get("http://localhost:5000/api/tests/"),
        axios.get("http://localhost:5000/api/payments/"),
        axios.get("http://localhost:5000/api/feedback/")
      ]);
  
      if (Array.isArray(evaluationsRes.data)) {
        setResult(evaluationsRes.data.filter(item => item.ID === candidateId));
      }
  
      if (Array.isArray(appointmentsRes.data)) {
        const filteredAppointments = appointmentsRes.data.filter(item => item.candidate_id === candidateId);
        setAppoiments(filteredAppointments);
  
        const upcomingAppointments = filteredAppointments.filter(app => new Date(app.TIME_SLOT) >= new Date());
        setNextAppointmentDate(
          upcomingAppointments.length ? new Date(upcomingAppointments[0].TIME_SLOT).toLocaleDateString() : 'No scheduled appointments'
        );
      }
  
      setTestsData(testsRes.data);
  
      if (Array.isArray(paymentsRes.data)) {
        setPayments(paymentsRes.data.filter(item => item.CANDIDATE_ID === candidateId));
      }
  
      setFeedback(feedbackRes.data);
  
      axios
      .get(`http://localhost:5000/api/auth/${candidateId}`)
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => console.error("Error fetching user data:", error));



    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  // ✅ Fetch data when component mounts & when candidateId changes
  useEffect(() => {
    fetchData();
  }, [candidateId]);
  
  const handleAdd = async () => {
    let a = prompt("Enter Your feedback");
    if (!a) return; // Prevent empty feedback
  
    try {
      await axios.post("http://localhost:5000/api/feedback/", {
        candidate_id: candidateId,
        feedback: a
      });
  
      console.log("Feedback submitted successfully");
  
      // ✅ Fetch updated feedback list immediately
      fetchData();
  
    } catch (error) {
      console.error("Error submitting feedback:", error.message);
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .put(`http://localhost:5000/api/auth/${candidateId}`, user)
      .then((response) => {
        setMessage("Profile updated successfully!");
      })
      .catch((error) => {
        setMessage("Error updating profile.");
        console.error("Update error:", error);
      });
  };

  // console.log(loggedInUser);
  


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
                Welcome, <span className="user-name">Candidate!</span> 👋
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
                <h3>{result.length} Tests Completed</h3>
                <p>Select tests to see</p>
              </div>
              <div className="overview-card">
                <FaCalendarAlt className="overview-icon" />
                <h3>Next Appointment</h3>
                <p>{nextAppointmentDate}</p>
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
              <p>View and analyze your test results.</p>
            </div>
            
                {/* <p>Access your test results and progress.</p>
                <button className="reports-btn">View</button> */}
                <table className="table" width="100%" border="1">
                  <thead>
                    <tr>
                      <th>TEST NAME</th>
                      <th>TEST_EVALUATION</th>
                    </tr>
                  </thead>
                  <tbody>
                  {result.length > 0 ? (
                    result.map((item) => (
                      
                      <tr key={item.TEST_EVALUATION_ID}>
                        <th>{item.TEST_NAME}</th>
                        <th>{item.TEST_EVALUATION}</th>
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

        {/* ========== Appointments Section ========== */}
        {activeSection === "appointments" && (
          <section className="appointments-section">
            <div className="appointments-banner">
              <h1>📅 My Appointments</h1>
              <p>Schedule consultations with our expert</p>
            </div>
          
            <table className="table" width="100%" border="1">
                  <thead>
                    <tr>
                      <th>APPOINTMENT_ID</th>
                      <th>PSYCHOLOGIST NAME</th>
                      <th>TEST NAME</th>
                      <th>TEST RESULT</th>
                      <th>TIME SLOT</th>
                    </tr>
                  </thead>
                  <tbody>
                  {appoiments.length > 0 ? (
                    appoiments.map((item) => (
                      
                      <tr key={item.APPOINTMENT_ID}>
                        <th>{item.APPOINTMENT_ID}</th>

                        <th>{item.psychologist_first_name} {item.psychologist_last_name}</th>
                        <th>{item.TEST_NAME}</th>
                        <th>{item.TEST_EVALUATION}</th>
                        <th>{new Date(item.TIME_SLOT).toLocaleString()}</th>
                        </tr>
                    ))
                  ) : (
                    <tr>
                      <th colSpan="5">No data available</th>
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
                      
                      <th>PSYCHOLOGIST NAME</th>
                      <th>APPOIMENT ID</th>
                      <th>PAYMENT METHOD</th>
                      <th>AMOUNT</th>
                      <th>DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                  {payments.length > 0 ? (
                    payments.map((item) => (
                      
                      <tr key={item.PAYMENT_ID}>
                        

                        <th>{item.PSYCHOLOGIST_FIRST_NAME}</th>
                        <th>{item.APPOINTMENT_ID}</th>
                        <th>{item.PAYMENT_METHOD}</th>
                        <th>{item.PAYMENT_AMOUNT}</th>
                        <th>{new Date(item.PAYMENT_DATE).toLocaleString()}</th>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <th colSpan="5">No data available</th>
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
            <div>
              Add Feedback <button className="test-btn" onClick={handleAdd}>Click here</button>
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
      name="first_name"
      value={user.first_name}
      onChange={handleChange}
      className="w-full p-2 border rounded"
    />
  </div>
  <div className="mb-4">
    <label className="block font-medium">Last Name:</label>
    <input
      type="text"
      name="last_name"
      value={user.last_name}
      onChange={handleChange}
      className="w-full p-2 border rounded"
    />
  </div>
  <div className="mb-4">
    <label className="block font-medium">Email:</label>
    <input
      type="email"
      name="email"
      value={user.email}
      onChange={handleChange}
      className="w-full p-2 border rounded"
    />
  </div>

  <div className="mb-4">
    <label className="block font-medium">Phone:</label>
    <input
      type="text"
      name="contact_number"
      value={user.contact_number}
      onChange={handleChange}
      className="w-full p-2 border rounded"
    />
  </div>



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

export default Dashboard;
