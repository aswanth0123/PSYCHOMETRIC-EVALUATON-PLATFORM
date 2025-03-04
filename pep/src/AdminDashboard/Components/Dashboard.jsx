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

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [result,setResult] = useState([])
  const [appoiments,setAppoiments] = useState([])
  const [upcomingCount, setUpcomingCount] = useState(0);

  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/appointments/upcoming/count/");
        setUpcomingCount(response.data.count);
      } catch (error) {
        console.error("Error fetching upcoming appointment count:", error);
      }
    };

    fetchUpcomingAppointments();
  }, []);
  const navigate = useNavigate();
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/test-evaluation/")
      .then((response) => (setResult(response.data)))
      .catch((error) => console.log("Error fetching test evaluations:", error));
  },[]); 
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/appoiments/")
      .then((response) => (setAppoiments(response.data)))
      .catch((error) => console.log("Error fetching test evaluations:", error));
  },[]); 
  console.log(result);
  const tests = [
    { id: 1, name: "Emotional Intelligence Test" },
    { id: 2, name: "Verbal Reasoning Test" },
    { id: 3, name: "Numerical Reasoning Test" },
    { id: 4, name: "Logical Reasoning Test" },
    { id: 5, name: "Situational Judgement Test" },
    { id: 6, name: "Decision Making Test" },
  ];

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
                Welcome, <span className="user-name">Admin!</span> 👋
              </h1>
              <p>Your psychometric journey!</p>
            </div>
            <div className="dashboard-overview">
              <div className="overview-card">
                <FaClipboardList className="overview-icon" />
                <h3>6 Tests Available</h3>
                <p>Start exploring now</p>
              </div>
              <div className="overview-card">
                <FaCheckCircle className="overview-icon" />
                <h3>Tests Completed</h3>
                <p>Select tests to see</p>
              </div>
              <div className="overview-card">
                <FaCalendarAlt className="overview-icon" />
                <h3>Next Appointment</h3>
                {upcomingCount > 0 ? (
                    <p>You have {upcomingCount} upcoming appointment(s)</p>
                  ) : (
                    <p>No upcoming appointments</p>
                  )}
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
              {tests.map((test) => (
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
            <table className="table" width="100%" border="1">
                  <thead>
                    <tr>
                      <th>TEST NAME</th>
                      <th>Candidate Name</th>
                      <th>TEST_EVALUATION</th>
                    </tr>
                  </thead>
                  <tbody>
                  {result.length > 0 ? (
                    result.map((item) => (
                      
                      <tr key={item.TEST_EVALUATION_ID}>
                        <th>{item.test_name}</th>
                        <th>{item.candidate_name}</th>
                        <th>{item.TEST_EVALUATION}</th>
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
                      <th>PSYCHOLOGIST NAME</th>
                      <th>CANDIDATE NAME</th>
                      <th>TEST NAME</th>
                      <th>TEST RESULT</th>
                      <th>TIME SLOT</th>
                    </tr>
                  </thead>
                  <tbody>
                  {appoiments.length > 0 ? (
                    appoiments.map((item) => (
                      
                      <tr key={item.APPOINTMENT_ID}>
                        <th>{item.TEST_ID}</th>
                        <th>{item.psychologist_name}</th>

                        <th>{item.candidate_name}</th>

                        <th>{item.test_name}</th>
                        <th>{item.test_result}</th>
                        <th>{item.TIME_SLOT}</th>
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
            <div className="card-list">
              <div className="custom-card">
                <h3>Payment History</h3>
                <p>Check all your previous payments</p>
                <button onClick={() => navigate("/payments")} className="payment-btn">
                  View History
                </button>
              </div>
            </div>
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
            <div className="card-list">
              <div className="custom-card">
                <h3>Share your feedback</h3>
                <p>Let us know how we can improve your experience.</p>
                <button onClick={() => navigate("/feedback")} className="feedback-btn">
                  Give Feedback
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
