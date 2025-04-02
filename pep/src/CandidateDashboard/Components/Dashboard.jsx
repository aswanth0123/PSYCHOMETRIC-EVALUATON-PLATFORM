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
  const [review,setReview] = useState(null);
  const [editing, setEditing] = useState(false);
  const [adding,setAdding] = useState(false)
  const [newfeed,setNewfeed] = useState(null)
  const [filters, setFilters] = useState({
    evaluationId: "",
    candidateName: "",
    testName: "",
    score: "",
    performance: "",
    FromDate: "",
    ToDate: "",
  });
  // console.log(loggedInUser);
  
  
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
  const [messageem, setMessageem] = useState("");
  const [messageph, setMessageph] = useState("");
    const [payfilters, setPayFilters] = useState({
      id: "",
      candidate: "",
      appointmentId: "",
      paymentMethod: "",
      paymentAmount: "",
      payFromDate: "",
      payToDate: "",
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




  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };
  const filteredEvaluations = result.filter((evalItem) => {
    const fullName = `${evalItem.first_name} ${evalItem.last_name}`.toLowerCase();
    const testName = evalItem.TEST_NAME.toLowerCase();
    const evaluationId = String(evalItem.TEST_EVALUATION_ID);
    const [score, performance] = evalItem.TEST_EVALUATION.split(", Performance: ");
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
  const fetchData = async () => {
    // console.log('data getting');
    
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
      // console.log('apoi',appointmentsRes.data);
      
      if (Array.isArray(appointmentsRes.data)) {
        const filteredAppointments = appointmentsRes.data.filter(item => item.candidate_id === candidateId);
        // console.log('filteredAppointments',filteredAppointments);
        
        setAppoiments(filteredAppointments);
  
        const upcomingAppointments = filteredAppointments
        .filter(app => new Date(app.TIME_SLOT) >= new Date())  // Only future bookings
        .sort((a, b) => new Date(a.TIME_SLOT) - new Date(b.TIME_SLOT)); // Sort in ascending order
      
      const nextUpcomingBooking = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;
      setNextAppointmentDate(nextUpcomingBooking);
      // console.log("Next Upcoming Booking:", nextUpcomingBooking);
      
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

    try {
      await axios.post("http://localhost:5000/api/feedback/", {
        candidate_id: candidateId,
        feedback: newfeed
      });
  
      // console.log("Feedback submitted successfully");
  
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
    setMessageem("")
    setMessageph("")
    axios
      .put(`http://localhost:5000/api/auth/${candidateId}`, user)
      .then((response) => {
        setMessage("Profile updated successfully!");
      })
      .catch((error) => {
        const errorMsg = error.response.data.error;
        if (errorMsg.includes("email")) {
          setMessageem("Email already exists. Please choose a different Email.");
        } else {
          setMessageem(""); // Clear email error if no email issue
        }

        if (errorMsg.includes("contact_number")) {
          setMessageph("Phone number already exists. Please choose a different phone number.");
        } else {
          setMessageph(""); // Clear phone error if no phone issue
        }
        console.error("Update error:", error.response.data);
      });
  };

  // console.log(loggedInUser);
  const handleDeleteReview = async (reviewId) => {
    axios.delete(`http://localhost:5000/api/feedback/${reviewId}`).then((response)=>{
      fetchData();
    }).catch((error)=>{
      console.log(error);
    })
  }

  const handleSave = async (reviewId) => {
    // console.log('reviewId',review);
    
    axios.put(`http://localhost:5000/api/feedback/${reviewId}`, review).then((response)=>{
      fetchData();
      // console.log('data');
      
    }).catch((error)=>{
      console.log(error);
    })
  }
  const handleEditReview = async (item) => {
    setReview(item); 
    setEditing(true);
  }
  const handleBookappointment = () =>{
    sessionStorage.setItem('quiz',null);
    sessionStorage.setItem('testEvaluationId',null);
    navigate('/appointment');
  }

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
                Welcome, <span className="user-name">{loggedInUser.name}!</span> 👋
              </h1>
              <p>Your psychometric journey!</p>
            </div>
            <div className="dashboard-overview">
              <div className="overview-card" onClick={() => setActiveSection("tests")}>
                <FaClipboardList className="overview-icon" />
                <h3>{testsData.length} Tests Available</h3>
                <p>Start exploring now</p>
              </div>
              {/* <div className="overview-card" onClick={() => setActiveSection("reports")}>
                <FaCheckCircle className="overview-icon" />
                <h3>{result.length} Tests Completed</h3>
                <p>Select tests to see</p>
              </div> */}
              <div className="overview-card" onClick={handleBookappointment}>
                <FaCalendarAlt className="overview-icon" />
                <h3>Book Appointment</h3>
                {/* <a href=""  style={{textDecoration:'none'}}>Click Here</a> */}
              </div>
              <div className="overview-card" onClick={() => setActiveSection("appointments")}>
                <FaCalendarAlt className="overview-icon" />
                <h3>Next Appointment</h3>
                {nextAppointmentDate ? (
  <p>{new Date(nextAppointmentDate.TIME_SLOT).toLocaleDateString()}</p>
) : (
  <p>No appointments</p>
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
            <div className="filter-container">

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
                {/* <p>Access your test results and progress.</p>
                <button className="reports-btn">View</button> */}

                <table className="table1" width="100%" border="1">
                  <thead>
                    <tr>
                      <th>TEST NAME</th>
                      <th>Score</th>
                      <th>PERFORMANCE</th>
                      <th>DATE</th>
                      <th>TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                  {filteredEvaluations.length > 0 ? (
                    filteredEvaluations.map((item) => (
                      
                      <tr key={item.TEST_EVALUATION_ID}>
                        <th>{item.TEST_NAME}</th>
                        <th>{item.TEST_EVALUATION 
                    ? item.TEST_EVALUATION.split(",")[0].replace("Score:", "").trim() 
                    : "No Score"}</th>
                            <th> {item.TEST_EVALUATION 
                    ? item.TEST_EVALUATION.split(",")[1].replace("Performance:", "").trim() 
                    : "No Performance"}</th>
                        <th>{new Date(item.CREATED_AT).toLocaleDateString()}</th>
                        <th>{new Date(item.CREATED_AT).toLocaleTimeString()}</th>
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

        {/* ========== Appointments Section ========== */}
        {activeSection === "appointments" && (
          <section className="appointments-section">
            <div className="appointments-banner">
              <h1>📅 My Appointments</h1>
              <p>Schedule consultations with our expert </p>
              <button className="reports-btn" onClick={()=>navigate('/appointment')}>Book Appointment</button>
            </div>
            <div style={{ marginTop: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
       
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
            <div className="dashboard-overview1 custom-scrollbar" style={{marginTop:'20px',overflowY:'auto',height:'500px'}}>

            {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((item) => (
            <div className="overview-card1" style={{cursor:'pointer',height:'340px'}}>
                <FaClipboardList className="overview-icon" />
                <h3>{item.psychologist_first_name} {item.psychologist_last_name}</h3>
                <p>Test Name :{item.TEST_NAME || "No Test Attended"} </p>
                <p>
                 Score: {item.TEST_EVALUATION 
                    ? item.TEST_EVALUATION.split(",")[0].replace("Score:", "").trim() 
                    : "No Score"}
                </p>
                <p>
                Performance : {item.TEST_EVALUATION 
                    ? item.TEST_EVALUATION.split(",")[1].replace("Performance:", "").trim() 
                    : "No Performance"}
                </p>
                <p><b>Date: {new Date(item.TIME_SLOT).toLocaleDateString()} </b></p>
                <p><b>Time: {new Date(item.TIME_SLOT).toLocaleTimeString()} </b></p>
                <p>Address: 123 Psychometric Tower, Chandkheda, Ahmedabad</p>
                <p>Status : {item.STATUS}</p>
              </div>
                              ))
                            ) : (
                              <tr>
                                <th colSpan="5">No data available</th>
                              </tr>
                            )}
                          </div>
            {/* <table className="table" width="100%" border="1">
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
                        <th>{item.TEST_NAME || "No Data"}</th>
                        <th>{item.TEST_EVALUATION || "No Data"}</th>
                        <th>{new Date(item.TIME_SLOT).toLocaleString()}</th>
                        </tr>
                    ))
                  ) : (
                    <tr>
                      <th colSpan="5">No data available</th>
                    </tr>
                  )} */}
                  {/* </tbody> */}
                {/* </table> */}

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
            {/* <input
              type="text"
              name="id"
              placeholder="Filter by ID"
              value={payfilters.id}
              onChange={handleFilterChangepay}
              className="search-input"
            /> */}
            {/* <input
              type="text"
              name="candidate"
              placeholder="Filter by Candidate"
              value={payfilters.candidate}
              onChange={handleFilterChangepay}
              className="search-input"
            /> */}
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

          </div>
            <table className="table1" width="100%" border="1">
                  <thead>
                    <tr>
                      
                      <th>PSYCHOLOGIST NAME</th>
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
                        

                        <th>{item.PSYCHOLOGIST_FIRST_NAME}</th>
                        <th>{item.APPOINTMENT_ID}</th>
                        <th>{item.PAYMENT_METHOD}</th>
                        <th>{item.PAYMENT_AMOUNT}</th>
                        <th>{new Date(item.PAYMENT_DATE).toLocaleDateString()}</th>
                        <th>{new Date(item.PAYMENT_DATE).toLocaleTimeString()}</th>
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
              Add Feedback <button className="test-btn" onClick={()=>setAdding(true)}>Click here</button>
            </div>
            {adding &&(
              <div>
                <form action="">
                  <input type="text" value={newfeed} onChange={(e) => setNewfeed(e.target.value)} />
                  <button onClick={handleAdd} className="test-btn">Add</button>
                </form>
              </div>
            )}
            {editing &&(
              <div>
                <form action="">
                <input type="text" value={review.FEEDBACK} onChange={(e) => setReview({ ...review, FEEDBACK: e.target.value })} />
                <button onClick={()=>handleSave(review.FEEDBACK_ID)} className="test-btn">Update</button>
                </form>
              </div>
            )}
            {/* <table className="table" width="100%" >
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
                        {item.CANDIDATE_ID == candidateId && <td style={{border:"none"}}><button onClick={() => handleEditReview(item)} className="test-btn">Edit</button> <button onClick={() => handleDeleteReview(item.FEEDBACK_ID)} className="test-btn">Delete</button></td>}
                    

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <th colSpan="3">No data available</th>
                    </tr>
                  )}
                  </tbody>
            </table> */}

            <div className="dashboard-overview1">
              {feedback.map((item) => (
                <div className="overview-card1" key={item.FEEDBACK_ID}>
                  <h3>{item.CANDIDATE_NAME}</h3>
                  <p>{item.FEEDBACK}</p>
                  {item.CANDIDATE_ID == candidateId && <div><button onClick={() => handleEditReview(item)} className="test-btn">Edit</button> <button onClick={() => handleDeleteReview(item.FEEDBACK_ID)} className="test-btn">Delete</button></div>}

                </div>
              ))}
            </div>

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
            {message && <p style={{color:"green"}}>{message}</p>}

            <div>

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
    {messageem && <p style={{color:"red"}}>{messageem}</p>}

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
        {messageph && <p style={{color:"red"}}>{messageph}</p>}

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
