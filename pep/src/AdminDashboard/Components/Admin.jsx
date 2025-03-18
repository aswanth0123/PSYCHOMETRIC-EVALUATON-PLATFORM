import "./AdminDashboard.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const AdminDashboard = () => {
  const [psychologists, setPsychologists] = useState([]);
  const [tests, setTests] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [card,setCard] = useState(true)
  const [editing,setEditing] = useState(false)
  const [adding,setAdding] = useState(false)
  const [newdata,setNewdata] = useState({TEST_NAME:'',TEST_DESCRIPTION:''})
  const [editdata,setEditdata] = useState(null)
  const [updatedTask,setUpdatedTask] = useState(null)
  const [admin, setAdmin] = useState({
    ADMIN_ID: '',
    ADMIN_FIRST_NAME: "",
    ADMIN_LAST_NAME: "",
    ADMIN_CONTACT_NO: "",
    ADMIN_EMAIL_ID: "",
  });    
  const [message, setMessage] = useState("");
const admin1 = JSON.parse(sessionStorage.getItem('admin'))
// console.log(admin,'admin');


  const navigate = useNavigate();
  useEffect(() => {
    fetchData();

  }, []);
    const fetchData = async () => {
      try {
        const [psychologistsRes, testsRes, evaluationsRes, appointmentsRes, paymentsRes,userRes] = await Promise.all([
          axios.get("http://localhost:5000/api/psychologist"),
          axios.get("http://localhost:5000/api/tests"),
          axios.get("http://localhost:5000/api/test-evaluations"),
          axios.get("http://localhost:5000/api/appointments"),
          axios.get("http://localhost:5000/api/payments/"),
          axios.get(`http://localhost:5000/api/admin/${admin1.ADMIN_ID}`)

        ]);

        setPsychologists(psychologistsRes.data);
        setTests(testsRes.data);
        setEvaluations(evaluationsRes.data);
        setAppointments(appointmentsRes.data);
        setPayments(paymentsRes.data);
        setAdmin(userRes.data);


      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    

  const questionload = (testid) => {
    navigate("/addquestion?testid=" + testid);
  }

  const handleChangeAdd = (e) => {
    setNewdata({ ...newdata, [e.target.name]: e.target.value });
  };

  const handleAdd = (e)=>{
    // e.preventDefault()
    axios.post('http://localhost:5000/api/tests/',newdata)
    setAdding(false)
    fetchData()
  }

  const deleteTest = (testid) => {
    axios.delete(`http://localhost:5000/api/tests/${testid}`)
    fetchData();
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  }
  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:5000/api/admin/update-admin/${admin1.ADMIN_ID}`, admin);
      alert(response.data.message);
    } catch (error) {
      console.error("Error updating admin:", error);
      alert("Failed to update admin");
    }
  };

  const editTask = (task)=>{
    console.log(task);
    setEditing(true)
    setUpdatedTask(task)
    
  }
  const handleChangeEdit = (e) => {
    setUpdatedTask({ ...updatedTask, [e.target.name]: e.target.value });
  };

  const handleSubmitUpdate = async (e) => {
    // e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5000/api/tests/update-task/${updatedTask.TEST_ID}`,  // API Endpoint
        updatedTask
      );

      if (response.status === 200) {
        alert("Task updated successfully!");
        setEditing(false); // Close the edit form
      } else {
        alert("Failed to update task!");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Error updating task.");
    }
  };

  return (
    <div>
      <header>
        <h1>Admin Dashboard</h1>
      </header>

      <nav>
        <a href="#manage-test" onClick={()=>setCard(true)}>Test Details</a>
        <a href="#manage-appointment" onClick={()=>setCard(false)}>Appoiment Details</a>
        <a href="#manage-doctors" onClick={()=>setCard(false)}>Doctors List</a>
        <a href="#manage-evaluvation" onClick={()=>setCard(false)}>Evaluvation Details</a>
        <a href="#manage-payments" onClick={()=>setCard(false)}>Payments</a>
        <a href="#settings" onClick={()=>setCard(false)}>Profile</a>
      </nav>

      <div className="container1">
        {/* Order Section */}
        {card && (
        <div className="section" id="manage-test">
          
        <h2>Manage Tests <button className="btn1" onClick={()=>setAdding(true)}>Add Test</button> </h2>
        {adding && (
          <>
          <h3>Add Test</h3>
          <form onSubmit={handleAdd}>
        <input
          type="text"
          name="TEST_NAME"
          value={newdata.TEST_NAME}
          onChange={handleChangeAdd} 
          placeholder="Enter  Test Name" // Allow input changes
        />
        <textarea
          name="TEST_DESCRIPTION"
          value={newdata.TEST_DESCRIPTION}
          onChange={handleChangeAdd}  // Allow textarea changes
          placeholder="Enter Description"
        />
        <button type="submit" className="btn1" style={{width:"100%"}}>Add</button> <br />
        <button type="button" className="btn1" style={{marginTop:"10px"}} onClick={() => setAdding(false)}>Cancel</button>
      </form>
          </>
        )}
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
                <button className="btn1" onClick={() => editTask(test)} >Edit</button>
                <button className="btn1" onClick={() => deleteTest(test.TEST_ID)} >Delete</button>

              </td>
            </tr>

          ))}

          </tbody>
        </table>
        {editing && (
          <>
          <h3>Edit test</h3>
          <form onSubmit={handleSubmitUpdate}>
        <input
          type="text"
          name="TEST_NAME"
          value={updatedTask.TEST_NAME}
          onChange={handleChangeEdit}  // Allow input changes
        />
        <textarea
          name="TEST_DESCRIPTION"
          value={updatedTask.TEST_DESCRIPTION}
          onChange={handleChangeEdit}  // Allow textarea changes
        />
        <button type="submit" className="btn1">Update</button> <br />
        <button type="button" className="btn1" style={{marginTop:"10px"}} onClick={() => setEditing(false)}>Cancel</button>
      </form>
          </>
        )}
      </div>

        )}

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

        <div className="section" id="manage-payments">
          <h2>Payments Details</h2>

          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Candidate</th>
                <th>Appoiment ID</th>
                <th>Payment Method</th>
                <th>Payment Amount</th>
                <th>Payment Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((pay) => (
                <tr key={pay.PAYMENT_ID}>
                  <td>{pay.PAYMENT_ID}</td>
                  <td>{pay.first_name} {pay.name}</td>
                  <td>{pay.APPOINTMENT_ID}</td>
                  <td>{pay.PAYMENT_METHOD}</td>
                  <td>{pay.PAYMENT_AMOUNT}</td>
                  <td>{new Date(pay.PAYMENT_DATE).toLocaleString()}</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>



        {/* Settings Section */}
        <div className="section" id="settings">
          <h2>Profile</h2>
          <p>Update your account settings, manage notifications, and customize the dashboard.</p>
          <button onClick={handleLogout} className="btn1">Logout</button>

          <h3>Update Profile</h3>
          <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label className="block font-medium">First Name</label>
          <input
            type="text"
            name="ADMIN_FIRST_NAME"
            value={admin.ADMIN_FIRST_NAME}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-2">
          <label className="block font-medium">Last Name</label>
          <input
            type="text"
            name="ADMIN_LAST_NAME"
            value={admin.ADMIN_LAST_NAME}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-2">
          <label className="block font-medium">Contact No</label>
          <input
            type="text"
            name="ADMIN_CONTACT_NO"
            value={admin.ADMIN_CONTACT_NO}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-2">
          <label className="block font-medium">Email</label>
          <input
            type="email"
            name="ADMIN_EMAIL_ID"
            value={admin.ADMIN_EMAIL_ID}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <button type="submit" className="btn1">
          Save Changes
        </button>
      </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;