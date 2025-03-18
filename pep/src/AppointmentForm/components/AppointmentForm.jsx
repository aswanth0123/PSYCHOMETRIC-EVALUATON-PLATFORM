import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ Import Axios
import "../styles/AppointmentForm.css"; // Importing CSS

const AppointmentForm = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]); // Store booked slots
  console.log(bookedSlots, "=============");
  console.log(selectedDate);
  const navigate = useNavigate();

  // Psychologist & Test details
  const psychologistId = 1;
  const testId = sessionStorage.getItem("quiz");
  const testEvaluationId = sessionStorage.getItem("testEvaluationId");

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

  // Available time slots
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

  // Fetch booked slots from the backend when a date is selected
  const fetchBookedSlots = async (date) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/appointments/booked?date=${date}`
      );

      // Normalize booked slots to match `timeSlots` format
      const booked = response.data.bookedSlots.map((time) => {
        const dateObj = new Date(`2025-01-01 ${time}`); // Temporary date for formatting
        return dateObj.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      });

      console.log(`📅 Booked slots for ${date}:`, booked);
      setBookedSlots(booked);
    } catch (error) {
      console.error("Error fetching booked slots:", error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      alert("Please select a date and time.");
      return;
    }

    // Convert to ISO 8601 format
    const formatTimeToISO = (date, time) => {
      const [timeValue, meridian] = time.split(" ");
      let [hours, minutes] = timeValue.split(":").map(Number);

      if (meridian === "PM" && hours !== 12) hours += 12;
      if (meridian === "AM" && hours === 12) hours = 0;

      return `${date} ${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}:00`;
    };

    const timeSlot = formatTimeToISO(selectedDate, selectedTime);

    const appointmentData = {
      PSYCHOLOGIST_ID: psychologistId,
      CANDIDATE_ID: JSON.parse(sessionStorage.getItem("user")).id,
      TEST_ID: testId,
      TEST_EVALUATION_ID: testEvaluationId,
      TIME_SLOT: timeSlot,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/appointments/",
        appointmentData,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ Appointment Created:", response.data);

      setConfirmationMessage(`Appointment successfully booked on ${timeSlot}.`);
      sessionStorage.setItem(
        "appointment",
        JSON.stringify(response.data.APPOINTMENT_ID)
      );

      setTimeout(() => {
        navigate("/payment");
      }, 1000);
    } catch (error) {
      console.error(
        "❌ Error creating appointment:",
        error.response?.data || error.message
      );
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
              onClick={() => {
                fetchBookedSlots(date); // Fetch booked slots for selected date

                setSelectedDate(date);
              }}
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
              {timeSlots.map((time) => {
                const normalizedTime = time.replace(/^(\d):/, "0$1:");
                return (
                  <button
                    key={time}
                    type="button"
                    className={`time-box ${
                      selectedTime === time ? "selected" : ""
                    }`}
                    onClick={() => setSelectedTime(time)}
                    disabled={bookedSlots.includes(normalizedTime)}
                  >
                    {time}
                  </button>
                );
              })}
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
      {confirmationMessage && (
        <p className="confirmation-message">{confirmationMessage}</p>
      )}
    </div>
  );
};

export default AppointmentForm;
