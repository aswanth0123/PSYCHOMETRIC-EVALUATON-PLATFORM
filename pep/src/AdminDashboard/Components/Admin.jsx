import "./AdminDashboard.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import logo from '../../assets/logo.png'
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  ImageRun,
  WidthType 
} from "docx";

const AdminDashboard = () => {
  const [psychologists, setPsychologists] = useState([]);
  const [tests, setTests] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [card, setCard] = useState(true);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newdata, setNewdata] = useState({
    TEST_NAME: "",
    TEST_DESCRIPTION: "",
  });
  const [editdata, setEditdata] = useState(null);
  const [updatedTask, setUpdatedTask] = useState(null);
  const [search, setSearch] = useState("");
  const [searcha1, setSearcha1] = useState("");
  const [searchb1, setSearchb1] = useState("");
  const [searchc1, setSearchc1] = useState("");
  const [searchd1, setSearchd1] = useState("");
  const [searche1, setSearche1] = useState("");
  const [searchf1, setSearchf1] = useState("");
  const [fromDate1, setFromDate1] = useState("");
  const [toDate1, setToDate1] = useState("");
  const [status, setStatus] = useState("");
  const [search3, setSearch3] = useState("");
  const [filters, setFilters] = useState({
    evaluationId: "",
    candidateName: "",
    testName: "",
    score: "",
    performance: "",
  });
  const [admin, setAdmin] = useState({
    ADMIN_ID: "",
    ADMIN_FIRST_NAME: "",
    ADMIN_LAST_NAME: "",
    ADMIN_CONTACT_NO: "",
    ADMIN_EMAIL_ID: "",
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
  const [message, setMessage] = useState("");
  const admin1 = JSON.parse(sessionStorage.getItem("admin"));

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
    const paymentDate = new Date(pay.PAYMENT_DATE).toLocaleDateString();
    const paymentTime = new Date(pay.PAYMENT_DATE).toLocaleTimeString();
    const fromDate = payfilters.payFromDate
      ? new Date(payfilters.payFromDate)
      : null;
    const toDate = payfilters.payToDate ? new Date(payfilters.payToDate) : null;
    const currentDate = new Date(paymentDate);

    const isDateInRange =
      (!fromDate || currentDate >= fromDate) &&
      (!toDate || currentDate <= toDate);

    return (
      id.includes(payfilters.id) &&
      fullName.includes(payfilters.candidate.toLowerCase()) &&
      appointmentId.includes(payfilters.appointmentId) &&
      paymentMethod.includes(payfilters.paymentMethod.toLowerCase()) &&
      paymentAmount.includes(payfilters.paymentAmount) &&
      isDateInRange
    );
  });
  const totalPayment = filteredPayments.reduce((total, pay) => {
    return total + parseFloat(pay.PAYMENT_AMOUNT || 0); // Convert to float & handle null values
  }, 0); 
  // console.log(admin,'admin');
  // Function to format the date as MM/DD/YYYY
  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredPayments.map((pay) => ({
        ID: pay.PAYMENT_ID,
        Candidate: `${pay.first_name} ${pay.name}`,
        Appointment_ID: pay.APPOINTMENT_ID,
        Payment_Method: pay.PAYMENT_METHOD,
        Payment_Amount: pay.PAYMENT_AMOUNT,
        Payment_Date: formatDate(pay.PAYMENT_DATE),
        Payment_Time: new Date(pay.PAYMENT_DATE).toLocaleTimeString(),
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, "Payments_Report.xlsx");
  };
  // Function to extract Score and Performance
  const extractScore = (evaluation) =>
    evaluation
      ? evaluation.split(",")[0].replace("Score:", "").trim()
      : "No Score";
  const extractPerformance = (evaluation) =>
    evaluation
      ? evaluation.split(",")[1].replace("Performance:", "").trim()
      : "No Performance";

  // Filter Appointments based on search input
  const filteredAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.TIME_SLOT);
    const from = fromDate1 ? new Date(fromDate1) : null;
    const to = toDate1 ? new Date(toDate1) : null;

    // Adjust date ranges to include the entire day
    if (from) from.setHours(0, 0, 0, 0); // Set fromDate to start of day (00:00:00)
    if (to) to.setHours(23, 59, 59, 999); // Set toDate to end of day (23:59:59)

    return (
      (searchf1 === "" ||
        appointment.APPOINTMENT_ID.toString().includes(searchf1)) &&
      (searcha1 === "" ||
        appointment.candidate_first_name
          .toLowerCase()
          .includes(searcha1.toLowerCase()) ||
        appointment.candidate_last_name
          .toLowerCase()
          .includes(searcha1.toLowerCase())) &&
      (searchb1 === "" ||
        appointment.psychologist_first_name
          .toLowerCase()
          .includes(searchb1.toLowerCase()) ||
        appointment.psychologist_last_name
          .toLowerCase()
          .includes(searchb1.toLowerCase())) &&
      (searchc1 === "" ||
        appointment.TEST_NAME?.toLowerCase().includes(
          searchc1.toLowerCase()
        )) &&
      (searchd1 === "" ||
        extractScore(appointment.TEST_EVALUATION)
          .toLowerCase()
          .includes(searchd1.toLowerCase())) &&
      (searche1 === "" ||
        extractPerformance(appointment.TEST_EVALUATION)
          .toLowerCase()
          .includes(searche1.toLowerCase())) &&
        (status === "all" || appointment.STATUS.toLowerCase().includes(status.toLowerCase())) &&

      (!from || appointmentDate >= from) && // Check if appointment is on or after the from date
      (!to || appointmentDate <= to)
    );
  });

  // Function to export data to Excel
  const exportToExcel1 = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredAppointments.map((appointment) => ({
        ID: appointment.APPOINTMENT_ID,
        Candidate_Name: `${appointment.candidate_first_name} ${appointment.candidate_last_name}`,
        Contact: appointment.candidate_phone,
        Email: appointment.candidate_email,
        Psychologist_Name: `${appointment.psychologist_first_name} ${appointment.psychologist_last_name}`,
        Test_Name: appointment.TEST_NAME || "No Data",
        Score: extractScore(appointment.TEST_EVALUATION),
        Performance: extractPerformance(appointment.TEST_EVALUATION),
        Date: formatDate(appointment.TIME_SLOT),
        Time: new Date(appointment.TIME_SLOT).toLocaleTimeString(),
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Appointments");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, "Appointments_Report.xlsx");
  };

  const downloadAppointmentsAsDocx = async() => {
    const logoBlob = await fetch(logo).then((res) => res.blob());
    
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
                                        new Paragraph({
                                          children: [
                                            new ImageRun({
                                              data: logoBlob,
                                              transformation: { width: 100, height: 100 }, // Adjust logo size
                                            }),
                                          ],
                                          alignment: "center",
                                          spacing: { after: 300 },
                                        }),
            new Paragraph({
              text: "Filtered Appointments",
              heading: "Title",
            }),
            new Table({
              rows: [
                // Table Header Row
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("ID")] }),
                    new TableCell({
                      children: [new Paragraph("Candidate Name")],
                    }),
                    new TableCell({
                      children: [new Paragraph("Psychologist")],
                    }),
                    new TableCell({ children: [new Paragraph("Test Name")] }),
                    new TableCell({ children: [new Paragraph("Score")] }),
                    new TableCell({ children: [new Paragraph("Performance")] }),
                    new TableCell({ children: [new Paragraph("Date")] }),
                    new TableCell({ children: [new Paragraph("Time")] }),
                  ],
                }),
                // Table Data Rows
                ...filteredAppointments.map(
                  (appointment) =>
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [
                            new Paragraph(
                              appointment.APPOINTMENT_ID.toString()
                            ),
                          ],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph(
                              `${appointment.candidate_first_name} ${appointment.candidate_last_name}`
                            ),
                          ],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph(
                              `${appointment.psychologist_first_name} ${appointment.psychologist_last_name}`
                            ),
                          ],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph(appointment.TEST_NAME || "No Data"),
                          ],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph(
                              extractScore(appointment.TEST_EVALUATION)
                            ),
                          ],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph(
                              extractPerformance(appointment.TEST_EVALUATION)
                            ),
                          ],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph(
                              new Date(
                                appointment.TIME_SLOT
                              ).toLocaleDateString()
                            ),
                          ],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph(
                              new Date(
                                appointment.TIME_SLOT
                              ).toLocaleTimeString()
                            ),
                          ],
                        }),
                      ],
                    })
                ),
              ],
            }),
          ],
        },
      ],
    });

    // Generate and download DOCX
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "Filtered_Appointments.docx");
    });
  };

  


  // Filter Tests based on search input
  const filteredTests = tests.filter((test) => {
    return (
      test.TEST_NAME.toLowerCase().includes(search3.toLowerCase()) ||
      test.TEST_DESCRIPTION.toLowerCase().includes(search3.toLowerCase())
    );
  });



  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      const [
        psychologistsRes,
        testsRes,
        evaluationsRes,
        appointmentsRes,
        paymentsRes,
        userRes,
      ] = await Promise.all([
        axios.get("http://localhost:5000/api/psychologist"),
        axios.get("http://localhost:5000/api/tests"),
        axios.get("http://localhost:5000/api/test-evaluations"),
        axios.get("http://localhost:5000/api/appointments"),
        axios.get("http://localhost:5000/api/payments/"),
        axios.get(`http://localhost:5000/api/admin/${admin1.ADMIN_ID}`),
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
  // fetchData()

  const questionload = (testid) => {
    navigate("/addquestion?testid=" + testid);
  };

  const handleChangeAdd = (e) => {
    setNewdata({ ...newdata, [e.target.name]: e.target.value });
  };

  const handleAdd = (e) => {
    // e.preventDefault()
    axios.post("http://localhost:5000/api/tests/", newdata);
    setAdding(false);
    navigate("/admindashboard");
    window.location.reload();
  };

  const deleteTest = (testid) => {
    axios.delete(`http://localhost:5000/api/tests/${testid}`);
    navigate("/admindashboard");
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/update-admin/${admin1.ADMIN_ID}`,
        admin
      );
      alert(response.data.message);
    } catch (error) {
      console.error("Error updating admin:", error);
      alert("Failed to update admin");
    }
  };

  const editTask = (task) => {
    console.log(task);
    setEditing(true);
    setUpdatedTask(task);
  };
  const handleChangeEdit = (e) => {
    setUpdatedTask({ ...updatedTask, [e.target.name]: e.target.value });
  };

  const handleSubmitUpdate = async (e) => {
    // e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5000/api/tests/update-task/${updatedTask.TEST_ID}`, // API Endpoint
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
    window.location.reload();
  };
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Filtering logic
  const filteredEvaluations = evaluations.filter((evalItem) => {
    const fullName =
      `${evalItem.first_name} ${evalItem.last_name}`.toLowerCase();
    const testName = evalItem.TEST_NAME.toLowerCase();
    const evaluationId = String(evalItem.TEST_EVALUATION_ID);
    const [score, performance] =
      evalItem.TEST_EVALUATION.split(", Performance: ");

    return (
      evaluationId.includes(filters.evaluationId) &&
      fullName.includes(filters.candidateName.toLowerCase()) &&
      testName.includes(filters.testName.toLowerCase()) &&
      score.replace("Score: ", "").includes(filters.score) &&
      performance.toLowerCase().includes(filters.performance.toLowerCase())
    );
  });
  const downloadReportAsDocx = async() => {
    const logoBlob = await fetch(logo).then((res) => res.blob());

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new ImageRun({
                  data: logoBlob,
                  transformation: { width: 100, height: 100 }, // Adjust logo size
                }),
              ],
              alignment: "center",
              spacing: { after: 300 },
            }),
            new Paragraph({
              text: "Evaluation Report",
              heading: "Title",
              spacing: { after: 200 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                // Table header
                new TableRow({
                  children: [
                    "Candidate Name",
                    "Test Name",
                    "Score",
                    "Performance",
                    "Date",
                  ].map((header) =>
                    new TableCell({
                      children: [new Paragraph(header)],
                    })
                  ),
                }),
                // Table rows
                ...filteredEvaluations.map((evalItem) => {
                  const [score, performance] = evalItem.TEST_EVALUATION.split(", Performance: ");
                  return new TableRow({
                    children: [
                      // new TableCell({ children: [new Paragraph(evalItem.TEST_EVALUATION_ID)] }),
                      new TableCell({
                        children: [new Paragraph(`${evalItem.first_name} ${evalItem.last_name}`)],
                      }),
                      new TableCell({ children: [new Paragraph(evalItem.TEST_NAME)] }),
                      new TableCell({ children: [new Paragraph(score.replace("Score: ", ""))] }),
                      new TableCell({ children: [new Paragraph(performance)] }),
                      new TableCell({
                        children: [
                          new Paragraph(new Date(evalItem.CREATED_AT).toLocaleDateString()),
                        ],
                      }),
                    ],
                  });
                }),
              ],
            }),
          ],
        },
      ],
    });
  
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "Evaluation_Report.docx");
    });
  };

  const downloadPaymentAsDocx = async() => {
    const logoBlob = await fetch(logo).then((res) => res.blob());

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new ImageRun({
                  data: logoBlob,
                  transformation: { width: 100, height: 100 }, // Adjust logo size
                }),
              ],
              alignment: "center",
              spacing: { after: 300 },
            }),
            new Paragraph({
              text: "Payment Report",
              heading: "Title",
              spacing: { after: 200 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                // Table header
                new TableRow({
                  children: [
                    "ID",
                    "Candidate",
                    "Appointment ID",
                    "Payment Method",
                    "Payment Amount",
                    "Payment Date",
                    "Payment Time",
                  ].map((header) =>
                    new TableCell({
                      children: [new Paragraph(header)],
                    })
                  ),
                }),
                // Table rows
                ...filteredPayments.map((pay) => {
                  return new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(pay.PAYMENT_ID.toString())] }),
                      new TableCell({
                        children: [new Paragraph(`${pay.first_name} ${pay.name}`)],
                      }),
                      new TableCell({ children: [new Paragraph(pay.APPOINTMENT_ID.toString())] }),
                      new TableCell({ children: [new Paragraph(pay.PAYMENT_METHOD)] }),
                      new TableCell({ children: [new Paragraph(pay.PAYMENT_AMOUNT.toString())] }),
                      new TableCell({
                        children: [
                          new Paragraph(new Date(pay.PAYMENT_DATE).toLocaleDateString()),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph(new Date(pay.PAYMENT_DATE).toLocaleTimeString()),
                        ],
                      }),
                    ],
                  });
                }),
              ],
            }),
          ],
        },
      ],
    });
  
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "Payment_Report.docx");
    });
  };
  const exportToExcel2 = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredPayments.map((pay) => ({
      ID: pay.PAYMENT_ID,
      Candidate: `${pay.first_name} ${pay.name}`,
      "Appointment ID": pay.APPOINTMENT_ID,
      "Payment Method": pay.PAYMENT_METHOD,
      "Payment Amount": pay.PAYMENT_AMOUNT,
      "Payment Date": new Date(pay.PAYMENT_DATE).toLocaleDateString(),
      "Payment Time": new Date(pay.PAYMENT_DATE).toLocaleTimeString(),
    })));
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
  
    // Create a binary Excel file and trigger download
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  
    saveAs(data, "payments.xlsx");
  };
  const exportToExcel3 = () => {
    if (!filteredEvaluations || filteredEvaluations.length === 0) {
      alert("No evaluations available to download.");
      return;
    }
  
    const data = filteredEvaluations.map((evalItem) => {
      const [score, performance] = evalItem.TEST_EVALUATION.split(", Performance: ");
      return {
        "Evaluation ID": evalItem.TEST_EVALUATION_ID,
        "Candidate Name": `${evalItem.first_name} ${evalItem.last_name}`,
        "Test Name": evalItem.TEST_NAME,
        Score: score.replace("Score: ", ""),
        Performance: performance,
        Date: new Date(evalItem.CREATED_AT).toLocaleDateString(),
      };
    });
  
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Evaluations");
  
    // Generate Excel file and trigger download
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  
    saveAs(blob, "evaluations.xlsx");
  };
  return (
    <div>
      <header>
        <h1>Admin Dashboard</h1>
      </header>

      <nav>
        <a href="#manage-test" onClick={() => setCard(true)}>
          Test Details
        </a>
        <a href="#manage-appointment" onClick={() => setCard(false)}>
          Appointment Details
        </a>
        <a href="#manage-doctors" onClick={() => setCard(false)}>
          Psychologist List
        </a>
        <a href="#manage-evaluvation" onClick={() => setCard(false)}>
          Test Reports
        </a>
        <a href="#manage-payments" onClick={() => setCard(false)}>
          Payments
        </a>
        <a href="./blockapt" onClick={() => setCard(false)}>Block Bookings</a>
        <a href="" onClick={(e)=>{
          e.preventDefault()
          console.log('btn pressed');
          
          downloadAppointmentsAsDocx()
          downloadReportAsDocx()
          downloadPaymentAsDocx()
        }}>Download All report</a>
        <a href="" onClick={handleLogout}>
          Logout
        </a>
      </nav>

      <div className="container1">
        {/* Order Section */}
        {card && (
          <div className="section" id="manage-test">
            <h2>
              Manage Tests{" "}
              <button className="btn1" onClick={() => setAdding(true)}>
                Add Test
              </button>{" "}
            </h2>

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
                    required
                  />
                  <textarea
                    name="TEST_DESCRIPTION"
                    value={newdata.TEST_DESCRIPTION}
                    onChange={handleChangeAdd} // Allow textarea changes
                    placeholder="Enter Description"
                    required
                  />
                  <button
                    type="submit"
                    className="btn1"
                    style={{ width: "100%" }}
                  >
                    Add
                  </button>{" "}
                  <br />
                  <button
                    type="button"
                    className="btn1"
                    style={{ marginTop: "10px" }}
                    onClick={() => setAdding(false)}
                  >
                    Cancel
                  </button>
                </form>
              </>
            )}
            <table className="table">
              <thead>
                <tr>
                  <th>Test ID</th>
                  <th>Test Name</th>
                  <th>DESCRIPTION</th>
                  <th>CREATED</th>
                  <th>UPDATED</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.map((test) => (
                  <tr key={test.TEST_ID}>
                    <td>{test.TEST_ID}</td>
                    <td>{test.TEST_NAME}</td>
                    <td>{test.TEST_DESCRIPTION}</td>
                    <td>{new Date(test.CREATED_AT).toLocaleDateString()}</td>
                    <td>{new Date(test.UPDATED_AT).toLocaleDateString()}</td>

                    {/* <td>{test.UPDATED_AT}</td> */}
                    <td id="tdbtn">
                      <button
                        className="btn1"
                        onClick={() => questionload(test.TEST_ID)}
                      >
                        Manage
                      </button>
                      <button className="btn1" onClick={() => editTask(test)}>
                        Edit
                      </button>
                      <button
                        className="btn1"
                        onClick={() => deleteTest(test.TEST_ID)}
                      >
                        Delete
                      </button>
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
                    onChange={handleChangeEdit} // Allow input changes
                  />
                  <textarea
                    name="TEST_DESCRIPTION"
                    value={updatedTask.TEST_DESCRIPTION}
                    onChange={handleChangeEdit} // Allow textarea changes
                  />
                  <button type="submit" className="btn1">
                    Update
                  </button>{" "}
                  <br />
                  <button
                    type="button"
                    className="btn1"
                    style={{ marginTop: "10px" }}
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {/* Product Management Section */}
        <div className="section" id="manage-appointment">
          <h2>Appointments</h2>
          <input
            type="text"
            placeholder="Search by Appointment ID..."
            value={searchf1}
            onChange={(e) => setSearchf1(e.target.value)}
            className="search-input"
          />
          <input
            type="text"
            placeholder="Search by Candidate Name..."
            value={searcha1}
            onChange={(e) => setSearcha1(e.target.value)}
            className="search-input"
          />

          <input
            type="text"
            placeholder="Search by Test Name..."
            value={searchc1}
            onChange={(e) => setSearchc1(e.target.value)}
            className="search-input"
          />

          <input
            type="text"
            placeholder="Search by Score..."
            value={searchd1}
            onChange={(e) => setSearchd1(e.target.value)}
            className="search-input"
          />

          <input
            type="text"
            placeholder="Search by Performance..."
            value={searche1}
            onChange={(e) => setSearche1(e.target.value)}
            className="search-input"
          />
          <input
            type="date"
            value={fromDate1}
            onChange={(e) => setFromDate1(e.target.value)}
            className="search-input"
          />

          {/* To Date Input */}
          <input
            type="date"
            value={toDate1}
            onChange={(e) => setToDate1(e.target.value)}
            className="search-input"
          />
          <select name="" id="" onChange={(e) => setStatus(e.target.value)} className="search-input">
            <option value="">all</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
          <br />
          <button
            onClick={exportToExcel1}
            style={{
              border: "none",
              background: "none",
              color: "blue",
              cursor: "pointer",
              fontSize: "1em",
            }}
          >
            📥 Download Excel
          </button>
          <button
            onClick={downloadAppointmentsAsDocx}
            style={{
              border: "none",
              background: "none",
              color: "blue",
              cursor: "pointer",
              fontSize: "1em",
            }}
          >
            {" "}
            📥 Download docx
          </button>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Candidate Name</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Psychologist Name</th>
                <th>Test Name</th>
                <th>Score</th>
                <th>Performance</th>
                <th>Date</th>
                <th>Time</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.APPOINTMENT_ID}>
                  <td>{appointment.APPOINTMENT_ID}</td>
                  <td>
                    {appointment.candidate_first_name || "Admin Blocked Booking"}{" "}
                    {appointment.candidate_last_name}
                  </td>
                  <td>{appointment.candidate_phone || "No Contact"}</td>
                  <td>{appointment.candidate_email || "No Email"}</td>
                  <td>
                    {appointment.psychologist_first_name}{" "}
                    {appointment.psychologist_last_name}
                  </td>
                  <td>{appointment.TEST_NAME || "No Data"}</td>
                  <td>
                    {appointment.TEST_EVALUATION
                      ? appointment.TEST_EVALUATION.split(",")[0]
                          .replace("Score:", "")
                          .trim()
                      : "No Score"}
                  </td>
                  <td>
                    {" "}
                    {appointment.TEST_EVALUATION
                      ? appointment.TEST_EVALUATION.split(",")[1]
                          .replace("Performance:", "")
                          .trim()
                      : "No Performance"}
                  </td>
                  <td>
                    {new Date(appointment.TIME_SLOT).toLocaleDateString()}
                  </td>
                  <td>
                    {new Date(appointment.TIME_SLOT).toLocaleTimeString()}
                  </td>
                  <td>{appointment.STATUS}</td>
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
                  <td>
                    {new Date(
                      psychologist.PSYCHOLOGIST_DOB
                    ).toLocaleDateString()}
                  </td>
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
          <h2>Test Reports</h2>
          <div className="filter-container">
            <input
              type="text"
              name="evaluationId"
              placeholder="Filter by Evaluation ID"
              value={filters.evaluationId}
              onChange={handleFilterChange}
              className="search-input"
            />
            <input
              type="text"
              name="candidateName"
              placeholder="Filter by Candidate Name"
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
              name="payFromDate"
              value={filters.FromDate}
              onChange={handleFilterChangepay}
              className="search-input"
            />
            <input
              type="date"
              name="payToDate"
              value={filters.ToDate}
              onChange={handleFilterChangepay}
              className="search-input"
            />
            <button
            onClick={exportToExcel3}
            style={{
              border: "none",
              background: "none",
              color: "blue",
              cursor: "pointer",
              fontSize: "1em",
            }}
          >
            📥 Download Excel
          </button>
                    <button
            onClick={downloadReportAsDocx}
            style={{
              border: "none",
              background: "none",
              color: "blue",
              cursor: "pointer",
              fontSize: "1em",
            }}
          >
            {" "}
            📥 Download docx
          </button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Evaluation ID</th>
                <th>Candidate Name</th>
                <th>Test Name</th>
                <th>Score</th>
                <th>Performance</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvaluations.length > 0 ? (
                filteredEvaluations.map((evalItem) => {
                  // Splitting evaluation details
                  const [score, performance] =
                    evalItem.TEST_EVALUATION.split(", Performance: ");
                  return (
                    <tr key={evalItem.TEST_EVALUATION_ID}>
                      <td>{evalItem.TEST_EVALUATION_ID}</td>
                      <td>
                        {evalItem.first_name} {evalItem.last_name}
                      </td>
                      <td>{evalItem.TEST_NAME}</td>
                      <td>{score.replace("Score: ", "")}</td>
                      <td>{performance}</td>
                      <td>
                        {new Date(evalItem.CREATED_AT).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6">No evaluations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="section" id="manage-payments">
          <h2>Payments Details</h2>
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
            <span style={{marginLeft: "10px"}}>Total Payments: {totalPayment}</span>
            <button
            onClick={exportToExcel2}
            style={{
              border: "none",
              background: "none",
              color: "blue",
              cursor: "pointer",
              fontSize: "1em",
            }}
          >
            📥 Download Excel
          </button>
            <button
            onClick={downloadPaymentAsDocx}
            style={{
              border: "none",
              background: "none",
              color: "blue",
              cursor: "pointer",
              fontSize: "1em",
            }}
          >
            {" "}
            📥 Download docx
          </button>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Candidate</th>
                <th>Appointment ID</th>
                <th>Payment Method</th>
                <th>Payment Amount</th>
                <th>Payment Date</th>
                <th>Payment Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((pay) => (
                <tr key={pay.PAYMENT_ID}>
                  <td>{pay.PAYMENT_ID}</td>
                  <td>
                    {pay.first_name} {pay.name}
                  </td>
                  <td>{pay.APPOINTMENT_ID}</td>
                  <td>{pay.PAYMENT_METHOD}</td>
                  <td>{pay.PAYMENT_AMOUNT}</td>
                  <td>{new Date(pay.PAYMENT_DATE).toLocaleDateString()}</td>
                  <td>{new Date(pay.PAYMENT_DATE).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Settings Section */}
        <div className="section" id="settings">
          <h2>Block slots </h2>
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
