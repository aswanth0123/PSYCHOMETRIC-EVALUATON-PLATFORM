import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
    const candidateId = JSON.parse(sessionStorage.getItem('user')).id;
    const psychologistId = 1;
    const amount = 300;
    let appointmentData = sessionStorage.getItem('appointmentData');

    if (!appointmentData) {
        appointmentData = JSON.parse(sessionStorage.getItem('appointmentData'));
    }

    console.log('appointment data', appointmentData);
    let response1;
    const navigate = useNavigate();

    const handlePayment = async () => {
        const res = await fetch("http://localhost:5000/api/payments/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 500, currency: "INR" }),
        });

        const order = await res.json();

        const options = {
            key: "rzp_test_MrmbaBWocQQF0J", // Razorpay test key
            amount: order.amount,
            currency: order.currency,
            name: "My App",
            description: "Test Transaction",
            order_id: order.id,
            handler: async function (response) {
                console.log("response =fro==================================", response);

                if (response) {
                    try {
                        response1 = await axios.post(
                            "http://localhost:5000/api/appointments/",
                            appointmentData,
                            { headers: { "Content-Type": "application/json" } }
                        );
                        console.log("✅ Appointment Created:", response1);
                    } catch (error) {
                        console.error("❌ Error creating appointment:", error.response1?.data || error.message);
                        alert("Failed to create appointment. Please try again.");
                    }
                }

                const paymentRes = await fetch(
                    `http://localhost:5000/api/payments/get-payment-method/${response.razorpay_payment_id}`
                );
                const paymentData = await paymentRes.json();
                console.log("paymentData", paymentData);
                
                const paymentMethod = paymentData.method;

                await fetch("http://localhost:5000/api/payments/save-payment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        candidate_id: candidateId,
                        psychologist_id: 1,
                        appointment_id: response1.data.APPOINTMENT_ID,
                        payment_method: paymentMethod, // 🔥 Dynamically set payment method
                        payment_amount: order.amount / 100,

                    }),
                });

                alert("Payment Successful!");
                navigate("/dashboard");
            },
            prefill: {
                name: "John Doe",
                email: "john.doe@example.com",
                contact: "9876543210",
            },
            theme: {
                color: "#3399cc",
            },
            method: {
                netbanking: true,
                card: true,
                upi: true,
                wallet: true,
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    handlePayment();
    return (
        <div>
            {/* <h2>Checkout</h2>
            <button onClick={handlePayment}>Proceed to Pay</button> */}
        </div>
    );
};

export default Checkout;
