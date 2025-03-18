import React from "react";
import { useNavigate } from "react-router-dom";
const Checkout = () => {
    const candidateId = JSON.parse(sessionStorage.getItem('user')).id //sessionStorage.getItem('user')
    console.log(candidateId);
    const psychologistId = 1
    const amount = 300
    const paymentMethod = 'online' 
    const appointmentId = JSON.parse(sessionStorage.getItem('appointment'))
    console.log(appointmentId);
    
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
                await fetch("http://localhost:5000/api/payments/save-payment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        candidate_id: candidateId,
                        psychologist_id: 1,
                        appointment_id: appointmentId,
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
