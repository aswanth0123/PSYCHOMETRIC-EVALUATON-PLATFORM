import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import axios from "axios";
import TestCard from "./Testcard";
import { Document, Packer, Paragraph, TextRun,ImageRun } from "docx";
import logo from "../../assets/logo.png";
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
  const [result, setResult] = useState([]);
  const [appoiments, setAppoiments] = useState([]);
  const [testsData, setTestsData] = useState([]);
  const [payments, setPayments] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [message, setMessage] = useState("");
  const [nextAppointmentDate, setNextAppointmentDate] = useState("");
  const [answers, setAnswers] = useState([]);



  const [user, setUser] = useState({
    PSYCHOLOGIST_FIRST_NAME: "",
    PSYCHOLOGIST_LAST_NAME: "",
    PSYCHOLOGIST_EMAIL_ID: "",
    PSYCHOLOGIST_CONTACT_NO: "",
    PSYCHOLOGIST_CERTIFICATIONS: "",
  });
  const [filters, setFilters] = useState({
    evaluationId: "",
    candidateName: "",
    testName: "",
    score: "",
    performance: "",
  });
  const [aptfilters, setAptFilters] = useState({
    candidateName: "",
    testName: "",
    score: "",
    performance: "",
    fromDate: "",
    toDate: "",
    status: "all",
  });
  const [payfilters, setPayFilters] = useState({
    id: "",
    candidate: "",
    appointmentId: "",
    paymentMethod: "",
    paymentAmount: "",
    payFromDate: "",
    payToDate: "",
  });

  const handleFilterChangepay = (e) => {
    setPayFilters({ ...payfilters, [e.target.name]: e.target.value });
  };

  // Filtering logic
  const filteredPayments = payments.filter((pay) => {
    const fullName = `${pay.first_name} ${pay.name}`.toLowerCase();
    const id = String(pay.PAYMENT_ID);
    const appointmentId = String(pay.APPOINTMENT_ID);
    const paymentMethod = pay.PAYMENT_METHOD.toLowerCase();
    const paymentAmount = String(pay.PAYMENT_AMOUNT);
  
    // ✅ Convert PAYMENT_DATE to a Date object and normalize time
    const paymentDate = new Date(pay.PAYMENT_DATE);
    paymentDate.setHours(0, 0, 0, 0); // Removes time for accurate comparison
  
    // ✅ Convert filter dates to Date objects and normalize time
    const fromDate = payfilters.payFromDate ? new Date(payfilters.payFromDate) : null;
    const toDate = payfilters.payToDate ? new Date(payfilters.payToDate) : null;
    if (fromDate) fromDate.setHours(0, 0, 0, 0);
    if (toDate) toDate.setHours(23, 59, 59, 999); // Include the full current day
  
    // ✅ Ensure the payment date is in range
    const isDateInRange =
      (!fromDate || paymentDate >= fromDate) &&
      (!toDate || paymentDate <= toDate);
  
    return (
      id.includes(payfilters.id) &&
      fullName.includes(payfilters.candidate.toLowerCase()) &&
      appointmentId.includes(payfilters.appointmentId) &&
      paymentMethod.includes(payfilters.paymentMethod.toLowerCase()) &&
      paymentAmount.includes(payfilters.paymentAmount) &&
      isDateInRange
    );

  });

  const psychologist = JSON.parse(sessionStorage.getItem("psychologist"));
  // console.log(psychologist.PSYCHOLOGIST_ID);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };
  const filteredEvaluations = result.filter((evalItem) => {
    const fullName =
      `${evalItem.first_name} ${evalItem.last_name}`.toLowerCase();
    const testName = evalItem.TEST_NAME.toLowerCase();
    const evaluationId = String(evalItem.TEST_EVALUATION_ID);
    const [score, performance] =
      evalItem.TEST_EVALUATION.split(", Performance: ");
    const evaluationDate = new Date(evalItem.CREATED_AT); // Ensure TEST_DATE is in 'YYYY-MM-DD' format

    // Convert filter dates to Date objects
    const fromDate = filters.FromDate ? new Date(filters.FromDate) : null;

    const toDate = filters.ToDate ? new Date(filters.ToDate) : null;
    if (toDate) {
      toDate.setHours(23, 59, 59, 999);
    }

    const currentDate = new Date(evaluationDate);

    const isDateInRange =
      (!fromDate || currentDate >= fromDate) &&
      (!toDate || currentDate <= toDate);
    return (
      evaluationId.includes(filters.evaluationId) &&
      fullName.includes(filters.candidateName.toLowerCase()) &&
      testName.includes(filters.testName.toLowerCase()) &&
      score.replace("Score: ", "").includes(filters.score) &&
      performance.toLowerCase().includes(filters.performance.toLowerCase()) &&
      isDateInRange
    );
  });
  const navigate = useNavigate();
  const fetchData = async () => {
    try {
      const [
        evaluations,
        tests,
        appointments,
        payments,
        feedback,
        psychologists,
      ] = await Promise.all([
        axios.get("http://localhost:5000/api/test-evaluations/"),
        axios.get("http://localhost:5000/api/tests/"),
        axios.get("http://localhost:5000/api/appointments/"),
        axios.get("http://localhost:5000/api/payments/"),
        axios.get("http://localhost:5000/api/feedback/"),
        axios.get(
          `http://localhost:5000/api/psychologist/${psychologist.PSYCHOLOGIST_ID}`
        ),
      ]);

      setAppoiments(appointments.data);
      setResult(evaluations.data);

      setTestsData(tests.data);
      const upcomingAppointments = appointments.data  
      .filter(app => new Date(app.TIME_SLOT) >= new Date())  // Only future bookings
      .sort((a, b) => new Date(a.TIME_SLOT) - new Date(b.TIME_SLOT)); // Sort in ascending order
    
    const nextUpcomingBooking = upcomingAppointments.length > 0 ? upcomingAppointments[0] : 'No appointments';
    console.log(
      "Next Upcoming Booking:",
      nextUpcomingBooking
    );
    
    setNextAppointmentDate(nextUpcomingBooking);
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

  const handleAccept = (id) => {
    axios
      .put(`http://localhost:5000/api/appointments/${id}`, {
        STATUS: "completed",
      })
      .then((response) => {
        setMessage("Test accepted successfully!");
        fetchData();
      })
      .catch((error) => {
        setMessage("Error accepting test.");
        console.error("Accept error:", error.message);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .put(
        `http://localhost:5000/api/psychologist/${psychologist.PSYCHOLOGIST_ID}`,
        user
      )
      .then((response) => {
        setMessage("Profile updated successfully!");
      })
      .catch((error) => {
        setMessage("Error updating profile.");
        console.error("Update error:", error.message);
      });
  };

  const generateTestReport = async (testData, ter) => {
    if (!testData || testData.length === 0) {
      console.error("No test data available.");
      return;
    }
    console.log("ter", ter);

    const candidate = testData[0]; // Assume all responses belong to the same candidate

    // Extracting Test Evaluation
    const [scoreText, performanceText] = ter.TEST_EVALUATION
      ? ter.TEST_EVALUATION.split(",")
      : ["Score: Test not given", "Performance: Test not given"];

    const score = scoreText.replace("Score:", "").trim();
    const performance = performanceText.replace("Performance:", "").trim();

    // Format Date of Birth
    const dob = new Date(candidate.dob).toLocaleDateString();
    const logoBlob = await fetch(logo).then((res) => res.blob());

    // Create Document Sections
    const doc = new Document({

      sections: [
        {
          properties: {},
          children: [
            // Candidate Information
                            new Paragraph({
                              children: [
                                new ImageRun({
                                  data: logoBlob,
                                  transformation: { width: 120, height: 60 }, // Adjust logo size
                                }),
                              ],
                              alignment: "center",
                              spacing: { after: 300 },
                            }),
            new Paragraph({
              text: `Test result of ${candidate.first_name} `,
              bold: true,
              size: 32,
              alignment: "center",
            }),
            new Paragraph({
              text: `First Name: ${candidate.first_name}`,
              size: 22,
            }),
            new Paragraph({
              text: `Last Name: ${candidate.last_name}`,
              size: 22,
            }),
            new Paragraph({ text: `DOB: ${dob}`, size: 22 }),
            new Paragraph({ text: `Gender: ${candidate.gender}`, size: 22 }),
            new Paragraph({
              text: `Contact No.: ${candidate.contact_number}`,
              size: 22,
            }),
            new Paragraph({ text: `Email Id: ${candidate.email}`, size: 22 }),
            new Paragraph({ text: "", spacing: { after: 200 } }),

            // Test Evaluation
            new Paragraph({ text: "Test Evaluation:", bold: true, size: 24 }),
            new Paragraph({ text: `- Score: ${score}`, size: 22 }),
            new Paragraph({ text: `- Performance: ${performance}`, size: 22 }),
            new Paragraph({ text: "", spacing: { after: 200 } }),

            // Test Details
            new Paragraph({
              text: `Test Name: ${candidate.TEST_NAME}`,
              bold: true,
              size: 24,
            }),
            new Paragraph({
              text: `Test Details: ${candidate.TEST_DESCRIPTION}`,
              size: 22,
            }),
            new Paragraph({ text: "", spacing: { after: 200 } }),

            // Test Questions and Responses
            new Paragraph({ text: "Test Set:", bold: true, size: 24 }),
            ...testData
              .map((q, index) => [
                new Paragraph({
                  text: `${index + 1}. ${q.question_text}`,
                  bold: true,
                  size: 22,
                }),
                new Paragraph({ text: `A) ${q.option_a}`, size: 20 }),
                new Paragraph({ text: `B) ${q.option_b}`, size: 20 }),
                new Paragraph({ text: `C) ${q.option_c}`, size: 20 }),
                new Paragraph({ text: `D) ${q.option_d}`, size: 20 }),
                new Paragraph({
                  text: `Suitable Option: ${q.correct_option}`,
                  bold: true,
                  size: 22,
                }),
                new Paragraph({
                  text: `Selected Option: ${q.SELECTED_OPTION}`,
                  size: 22,
                }),
                new Paragraph({ text: "", spacing: { after: 150 } }),
              ])
              .flat(),
          ],
        },
      ],
    });

    // Save the Document as a File
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `Test_Report_${candidate.first_name}.docx`);
    });

    console.log("Test Report generated successfully.");
  };

  const handleResult = (apt) => {
    const test_data = result.find(
      (test) => test.TEST_EVALUATION_ID === apt.TEST_EVALUATION_ID
    );

    if (!test_data) {
      console.error("Test data not found for appointment:", apt);
      return;
    }

    // Prevent multiple API calls if answers already exist
    if (answers.length > 0) {
      // console.log("Data already fetched:", answers);
      return;
    }

    // console.log("Fetching data for ID:", test_data.TEST_ATTEND_ID);

    axios
      .get(
        `http://localhost:5000/api/questionResult/${test_data.TEST_ATTEND_ID}`
      )
      .then((response) => {
        setAnswers(response.data);
        generateTestReport(response.data, test_data);
        setAnswers("");
        console.log("Fetched Answers:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching answers:", error);
      });
  };

  const formatDate = (date) => new Date(date).toISOString().split("T")[0];

  // Handle filter changes dynamically
  const handleaptFilterChange = (e) => {
    const { name, value } = e.target;
    setAptFilters({ ...aptfilters, [name]: value });
  };

  const filteredAppointments = appoiments.filter((item) => {
    const itemDate = formatDate(item.TIME_SLOT);
    const testEvaluation = item.TEST_EVALUATION || ""; // Ensure it's always a string
    const data = item.TEST_NAME || "";

    return (
      item.candidate_first_name.toLowerCase().includes(aptfilters.candidateName.toLowerCase()) &&
      data.toLowerCase().includes(aptfilters.testName.toLowerCase()) &&
      (aptfilters.score === "" || testEvaluation.includes(`Score: ${aptfilters.score}`)) &&
      (aptfilters.performance === "" || testEvaluation.includes(`Performance: ${aptfilters.performance}`)) &&
      (aptfilters.fromDate === "" || itemDate >= aptfilters.fromDate) &&
      (aptfilters.toDate === "" || itemDate <= aptfilters.toDate) &&
      (aptfilters.status === "all" || item.STATUS === aptfilters.status)
    );
});


  const totalPayment = filteredPayments.reduce((total, pay) => {
    return total + parseFloat(pay.PAYMENT_AMOUNT || 0); // Convert to float & handle null values
  }, 0); 
 
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
                Welcome,{" "}
                <span className="user-name">
                  {psychologist.PSYCHOLOGIST_FIRST_NAME}
                </span>{" "}
                👋
              </h1>
              <p>Your psychometric journey!</p>
            </div>
            <div className="dashboard-overview">
              <div
                className="overview-card"
                onClick={() => setActiveSection("tests")}
              >
                <FaClipboardList className="overview-icon" />
                <h3>{testsData.length} Tests Available</h3>
                <p>Start exploring now</p>
              </div>
              <div
                className="overview-card"
                onClick={() => setActiveSection("appointments")}
              >
                <FaCheckCircle className="overview-icon" />
                <h3>{appoiments.filter((item) => item.STATUS === "pending").length} Pending appoiments</h3>
                <p>View details on Appointment</p>
              </div>
              <div
                className="overview-card"
                onClick={() => setActiveSection("appointments")}
              >
                <FaCalendarAlt className="overview-icon" />
                <h3>Next Appointment</h3>
                <p>{new Date(nextAppointmentDate.TIME_SLOT).toLocaleDateString()}</p>
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
              <h1>📑 Test Results</h1>
              <p>View and analyze test results.</p>
            </div>
            <div className="filter-container" style={{ marginTop: "20px" }}>
              <input
                type="text"
                name="candidateName"
                placeholder="Filter by candidate Name"
                value={filters.candidateName}
                onChange={handleFilterChange}
                className="search-input"
              />
              <input
                type="text"
                name="testName"
                placeholder="Filter by Test Name"
                value={filters.testName}
                onChange={handleFilterChange}
                className="search-input"
              />
              <input
                type="text"
                name="score"
                placeholder="Filter by Score"
                value={filters.score}
                onChange={handleFilterChange}
                className="search-input"
              />
              <input
                type="text"
                name="performance"
                placeholder="Filter by Performance"
                value={filters.performance}
                onChange={handleFilterChange}
                className="search-input"
              />
              <input
                type="date"
                name="FromDate"
                value={filters.FromDate}
                onChange={handleFilterChange}
                className="search-input"
              />
              <input
                type="date"
                name="ToDate"
                value={filters.ToDate}
                onChange={handleFilterChange}
                className="search-input"
              />
            </div>
            <table className="table1" width="100%" border="1">
              <thead>
                <tr>
                  <th>TEST NAME</th>
                  <th>Candidate Name</th>
                  <th>Score</th>
                  <th>Performance</th>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvaluations.length > 0 ? (
                  filteredEvaluations.map((item) => (
                    <tr key={item.TEST_EVALUATION_ID}>
                      <th>{item.TEST_NAME}</th>
                      <th>
                        {item.first_name} {item.last_name}
                      </th>
                      <th>
                        {item.TEST_EVALUATION
                          ? item.TEST_EVALUATION.split(",")[0]
                              .replace("Score:", "")
                              .trim()
                          : "No Score"}
                      </th>
                      <th>
                        {" "}
                        {item.TEST_EVALUATION
                          ? item.TEST_EVALUATION.split(",")[1]
                              .replace("Performance:", "")
                              .trim()
                          : "No Performance"}
                      </th>
                      <th>{new Date(item.CREATED_AT).toLocaleDateString()}</th>
                      <th>{new Date(item.CREATED_AT).toLocaleTimeString()}</th>
                    </tr>
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

        {/* ========== Appointments Section ========== */}
        {activeSection === "appointments" && (
          <section className="appointments-section">
            <div className="appointments-banner">
              <h1>📅 Appointments</h1>
            </div>
            <div className="dashboard-overview" style={{ marginTop: "20px" }}>
              <div
                className="overview-card"
              >
                <h3>Total Appointments</h3>
                <p>{appoiments.length}</p>
              </div>
              <div
                className="overview-card"
              >
                <h3>Pending Appointments</h3>
                <p>
                  {appoiments.filter((item) => item.STATUS == "pending").length}
                </p>
              </div>
              <div
                className="overview-card"
              >
                <h3>Completed Appointments</h3>
                <p>
                  {
                    appoiments.filter((item) => item.STATUS == "completed")
                      .length
                  }{" "}
                </p>
              </div>
            </div>
            <div style={{ marginTop: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input type="text" name="candidateName" placeholder="Search Candidate" value={aptfilters.candidateName} onChange={handleaptFilterChange} style={{ padding: "5px" }} className="search-input"
 />
              <input type="text" name="testName" placeholder="Search Test" value={aptfilters.testName} onChange={handleaptFilterChange} style={{ padding: "5px" }}  className="search-input" />
              <input type="text" name="score" placeholder="Search Score" value={aptfilters.score} onChange={handleaptFilterChange} style={{ padding: "5px" }}  className="search-input" />
              <input type="text" name="performance" placeholder="Search Performance" value={aptfilters.performance} onChange={handleaptFilterChange} style={{ padding: "5px" }}  className="search-input" />
              <input type="date" name="fromDate" value={aptfilters.fromDate} onChange={handleaptFilterChange} style={{ padding: "5px" }}  className="search-input" />
              <input type="date" name="toDate" value={aptfilters.toDate} onChange={handleaptFilterChange} style={{ padding: "5px" }}  className="search-input" />
              <select name="status" value={aptfilters.status} onChange={handleaptFilterChange} style={{ padding: "5px" }}  className="search-input">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <table className="table1" width="100%" border="1">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>CANDIDATE NAME</th>
                  <th>TEST NAME</th>
                  <th>TEST SCORE</th>
                  <th>TEST PERFORMANCE</th>
                  <th>DATE</th>
                  <th>TIME</th>
                  <th>STATUS</th>
                  <th>Actions</th>
                  <th>Test Report</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((item) => (
                    <tr key={item.APPOINTMENT_ID}>
                      <th>{item.APPOINTMENT_ID}</th>

                      <th>{item.candidate_first_name}</th>
                      <th>{item.TEST_NAME ? item.TEST_NAME : "No Test"}</th>
                      <th>
                        {item.TEST_EVALUATION
                          ? item.TEST_EVALUATION.split(",")[0]
                              .replace("Score:", "")
                              .trim()
                          : "No Score"}
                      </th>
                      <th>
                        {" "}
                        {item.TEST_EVALUATION
                          ? item.TEST_EVALUATION.split(",")[1]
                              .replace("Performance:", "")
                              .trim()
                          : "No Performance"}
                      </th>
                      <th>{new Date(item.TIME_SLOT).toLocaleDateString()}</th>
                      <th>{new Date(item.TIME_SLOT).toLocaleTimeString()}</th>
                      <th>{item.STATUS}</th>
                      <th>
                        {item.STATUS == "pending" ? (
                          <button
                          style={{display:"block",margin:"auto"}}
                            onClick={() => handleAccept(item.APPOINTMENT_ID)}
                            className="mark-completed"
                          >
                            mark as completed
                          </button>
                        ) : (
                          <p className="mark-completed1">Completed</p>
                        )}
                      </th>
                      <th>
                        {item.TEST_NAME ? (
                             <button style={{display:"block",margin:"auto"}}
                             onClick={() => handleResult(item)}
                             className="mark-completed2"
                           >                          View Report
                        </button>
                        ) : (
                          <p className="mark-completed1">No Report</p>
                        )
                        }

                      </th>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <th colSpan="10">No data available</th>
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
            <div className="filter-container">
            <input
              type="text"
              name="id"
              placeholder="Filter by ID"
              value={payfilters.id}
              onChange={handleFilterChangepay}
              className="search-input"
            />
            <input
              type="text"
              name="candidate"
              placeholder="Filter by Candidate"
              value={payfilters.candidate}
              onChange={handleFilterChangepay}
              className="search-input"
            />
            <input
              type="text"
              name="appointmentId"
              placeholder="Filter by Appointment ID"
              value={payfilters.appointmentId}
              onChange={handleFilterChangepay}
              className="search-input"
            />
            <input
              type="text"
              name="paymentMethod"
              placeholder="Filter by Payment Method"
              value={payfilters.paymentMethod}
              onChange={handleFilterChangepay}
              className="search-input"
            />
            {/* <input
          type="text"
          name="paymentAmount"
          placeholder="Filter by Payment Amount"
          value={payfilters.paymentAmount}
          onChange={handleFilterChangepay}
        /> */}
            <input
              type="date"
              name="payFromDate"
              value={payfilters.payFromDate}
              onChange={handleFilterChangepay}
              className="search-input"
            />
            <input
              type="date"
              name="payToDate"
              value={payfilters.payToDate}
              onChange={handleFilterChangepay}
              className="search-input"
            />
            <span style={{marginLeft:"10px"}}>Total amount paid : {totalPayment}</span>

          </div>
            <table className="table1" width="100%" border="1">
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
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((item) => (
                    <tr key={item.PAYMENT_ID}>
                      <th>{item.PAYMENT_ID}</th>
                      <th>{item.first_name}</th>
                      <th>{item.APPOINTMENT_ID}</th>
                      <th>{item.PAYMENT_METHOD}</th>
                      <th>{item.PAYMENT_AMOUNT}</th>
                      <th>
                        {new Date(item.PAYMENT_DATE).toLocaleDateString()}
                      </th>
                      <th>
                        {new Date(item.PAYMENT_DATE).toLocaleTimeString()}
                      </th>{" "}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <th colSpan="7">No data available</th>
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
            <div className="dashboard-overview1">
              {feedback.map((item) => (
                <div className="overview-card1" key={item.FEEDBACK_ID}>
                  <h3>{item.CANDIDATE_NAME}</h3>
                  <p>{item.FEEDBACK}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========== Settings Section ========== */}
        {activeSection === "settings" && (
          <section className="feedback-section">
            <div className="banner feedback-banner">
              <h1>Profile</h1>
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
