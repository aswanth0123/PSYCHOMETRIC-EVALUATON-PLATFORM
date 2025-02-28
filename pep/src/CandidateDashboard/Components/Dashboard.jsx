import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TestCard from "./Testcard";
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
  const navigate = useNavigate();

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
                Welcome, <span className="user-name">Candidate!</span> 👋
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
                <p>No scheduled appointments</p>
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
            <div className="card-list">
              <div className="custom-card">
                <h3>View Results</h3>
                <p>Access your test results and progress.</p>
                <button className="reports-btn">View</button>
              </div>
            </div>
          </section>
        )}

        {/* ========== Appointments Section ========== */}
        {activeSection === "appointments" && (
          <section className="appointments-section">
            <div className="appointments-banner">
              <h1>📅 My Appointments</h1>
              <p>Schedule consultations with our expert</p>
            </div>
            <div className="card-list">
              <div className="custom-card">
                <h3>Book an Appointment</h3>
                <p>Schedule a consultation with our expert.</p>
                <button
                  onClick={() => navigate("/appointment")}
                  className="appointment-btn"
                >
                  Book now
                </button>
              </div>
            </div>
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

export default Dashboard;
