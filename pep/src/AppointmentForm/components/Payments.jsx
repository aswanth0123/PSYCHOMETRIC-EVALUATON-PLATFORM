import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
const Checkout = () => {
    const candidateId = JSON.parse(sessionStorage.getItem('user')).id //sessionStorage.getItem('user')
    console.log(candidateId);
    const psychologistId = 1
    const amount = 300
    const paymentMethod = 'online' 
    let appointmentData = sessionStorage.getItem('appointmentData')
    if(!appointmentData){
        appointmentData = JSON.parse(sessionStorage.getItem('appointmentData'))
    }
    console.log('appointment data', appointmentData);
    
    let response1
    // const appointmentId = JSON.parse(sessionStorage.getItem('appointment'))
    // console.log(appointmentId);
    
    const navigate = useNavigate();
    const handlePayment = async () => {
        const res = await fetch("http://localhost:5000/api/payments/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 500, currency: "INR" }),
        });
    
        const order = await res.json();
    
        const options = {
            key: "rzp_test_MrmbaBWocQQF0J",
            amount: order.amount,
            currency: order.currency,
            name: "My App",
            description: "Test Transaction",
            order_id: order.id,
            handler: async function (response) {
                console.log(response);
                if(response){
                    try {
             response1 = await axios.post(
                          "http://localhost:5000/api/appointments/",
                          appointmentData,
                          { headers: { "Content-Type": "application/json" } }
                        );
                  
                        console.log("✅ Appointment Created:", response1);
                      } catch (error) {
                        console.error(
                          "❌ Error creating appointment:",
                          error.response1?.data || error.message
                        );
                        alert("Failed to create appointment. Please try again.");
                      }                }
                await fetch("http://localhost:5000/api/payments/save-payment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        candidate_id: candidateId,
                        psychologist_id: 1,
                        appointment_id: response1.data.APPOINTMENT_ID,
                        payment_method: "Razorpay",
                        payment_amount: order.amount / 100,
                    }),
                });
                alert("Payment Successful!");
                navigate("/dashboard");
            },
        };
    
        const rzp = new window.Razorpay(options);
        rzp.open();
    };
    
    console.log('payment data');
    
    handlePayment() 
    return (
        <div>
            </div>
    );
};

export default Checkout;
