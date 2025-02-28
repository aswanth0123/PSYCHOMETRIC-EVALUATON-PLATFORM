import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/AppointmentForm.css"; // Importing CSS

const AppointmentForm = ({ candidateName }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const navigate = useNavigate(); // Hook for navigation

  // Generate next 7 days for booking
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      alert("Please select a date and time.");
      return;
    }

    setConfirmationMessage(
      `Appointment booked for Candidate with Dr. Psychologist on ${selectedDate} at ${selectedTime}.`
    );
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
        <h3>Candidate: {candidateName}</h3>

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
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          Back to Dashboard
        </button>

      {/* Confirmation Message */}
      {confirmationMessage && <p className="confirmation-message">{confirmationMessage}</p>}
    </div>
  );
};

export default AppointmentForm;
