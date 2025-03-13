import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ Import Axios
import "../styles/AppointmentForm.css"; // Importing CSS

const AppointmentForm = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const navigate = useNavigate();

  // Psychologist & Test details (Modify based on actual data)
  const psychologistId = 1; // Replace with dynamic data if needed
  const testId = sessionStorage.getItem("quiz"); // Replace with actual Test ID
  const testEvaluationId = sessionStorage.getItem("testEvaluationId"); // Replace with actual Evaluation ID

  // Generate next 7 days for booking
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split("T")[0]); // Format: YYYY-MM-DD
    }
    return dates;
  };

  // Available time slots (11 AM - 6 PM, 1-hour gaps)
  const timeSlots = [
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
  ];

  // Handle form submission (Send to API)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      alert("Please select a date and time.");
      return;
    }

    // Combine date & time into a single format
    // const timeSlot = `${selectedDate} ${selectedTime}`;
    const formatTimeToISO = (date, time) => {
      const [timeValue, meridian] = time.split(" ");
      let [hours, minutes] = timeValue.split(":").map(Number);
    
      if (meridian === "PM" && hours !== 12) hours += 12;
      if (meridian === "AM" && hours === 12) hours = 0;
    
      const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
      return `${date} ${formattedTime}`; // Convert to ISO 8601 format
    };
    
    const timeSlot = formatTimeToISO(selectedDate, selectedTime);
    
    const appointmentData = {
      PSYCHOLOGIST_ID: 1,
      CANDIDATE_ID: JSON.parse(sessionStorage.getItem("user")).id,
      TEST_ID: testId,
      TEST_EVALUATION_ID: testEvaluationId,
      TIME_SLOT: timeSlot,
    };
    console.log("Appointment Data being sent:", appointmentData);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/appointments/", 
        appointmentData,  // Ensure this object has the correct fields
        {
          headers: { "Content-Type": "application/json" }
        }

      );
    
      console.log("✅ Appointment Created:", response.data);
      
      setConfirmationMessage(
        `Appointment successfully booked for Candidate ID ${appointmentData.CANDIDATE_ID} 
        with Dr. Psychologist on ${appointmentData.TIME_SLOT}.`
      );
      sessionStorage.setItem("appointment", JSON.stringify(response.data.APPOINTMENT_ID));
      setTimeout(() => {
        navigate("/payment");
      })
    } catch (error) {
      console.error("❌ Error creating appointment:", error.response?.data || error.message);
      alert("Failed to create appointment. Please try again.");
    }
  };    

  return (
    <div className="appointment-container">
      {/* Psychologist Information */}
      <div className="psychologist-info">
        <h2>Dr. Psychologist</h2>
        <p>PhD in Clinical Psychology | 10+ Years Experience</p>
      </div>

      {/* Appointment Form */}
      <form onSubmit={handleSubmit} className="appointment-form">
        <h3>Candidate ID: {JSON.parse(sessionStorage.getItem("user")).id}</h3>

        {/* Date Selection */}
        <h3>Select a Date</h3>
        <div className="date-container">
          {generateDates().map((date) => (
            <button
              key={date}
              type="button"
              className={`date-box ${selectedDate === date ? "selected" : ""}`}
              onClick={() => setSelectedDate(date)}
            >
              {new Date(date).toDateString()}
            </button>
          ))}
        </div>

        {/* Time Slot Selection */}
        {selectedDate && (
          <>
            <h3>Select a Time</h3>
            <div className="time-container">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  className={`time-box ${selectedTime === time ? "selected" : ""}`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Submit Button */}
        <button type="submit" className="submit-btn">
          Book Appointment
        </button>
      </form>

      {/* Back to Dashboard Button */}
      <button onClick={() => navigate("/dashboard")} className="back-btn">
        Back to Dashboard
      </button>

      {/* Confirmation Message */}
      {confirmationMessage && <p className="confirmation-message">{confirmationMessage}</p>}
    </div>
  );
};

export default AppointmentForm;
