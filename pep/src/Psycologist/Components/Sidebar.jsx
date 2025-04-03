import React from "react";
import { FaHome, FaClipboardList, FaChartBar, FaCalendarAlt, FaCreditCard, FaCommentDots, FaSignOutAlt } from "react-icons/fa"; // Import the log-out icon
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "../styles/Sidebar.css";

const Sidebar = ({ setActiveSection }) => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogout = () => {
    // Clear any user-related data (if applicable, like localStorage, session, etc.)
    // localStorage.clear(); // Example for clearing local storage

    // Redirect to the homepage (or login page, depending on your app)
    navigate("/"); // Redirects to the homepage ("/")
  };

  return (
    <div className="sidebar">
      <h2 className="logo">PHYCOLINC</h2>
      <ul>
        <li onClick={() => setActiveSection("dashboard")}>
          <FaHome className="sidebar-icon" />
          <span>Dashboard</span>
        </li>
        <li onClick={() => setActiveSection("tests")}>
          <FaClipboardList className="sidebar-icon" />
          <span>Tests</span>
        </li>
        <li onClick={() => setActiveSection("reports")}>
          <FaChartBar className="sidebar-icon" />
          <span>Reports</span>
        </li>
        <li onClick={() => setActiveSection("appointments")}>
          <FaCalendarAlt className="sidebar-icon" />
          <span>Appointments</span>
        </li>
        {/* NEW: Payments */}
        <li onClick={() => setActiveSection("payments")}>
          <FaCreditCard className="sidebar-icon" />
          <span>Payments</span>
        </li>
        {/* NEW: Feedback */}
        <li onClick={() => setActiveSection("feedback")}>
          <FaCommentDots className="sidebar-icon" />
          <span>Feedback</span>
        </li>
        
        <li onClick={() => setActiveSection("settings")}>
          <span>Profile</span>
        </li>
      </ul>
      
      
      {/* Log Out Button */}
      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt className="sidebar-icon" />
        <span>Log Out</span>
      </button>
    </div>
  );
};

export default Sidebar;
