import React from "react";

const Checkout = ({ appointmentId }) => {
    const candidateId = sessionStorage.getItem('user')
    console.log(candidateId);
    const psychologistId = 1
    const amount = 300
    const paymentMethod = 'online' 

    const handlePayment = async () => {
        try {
            // ✅ **Step 1: Create Order on Backend**
            const response = await fetch("http://localhost:5000/payment/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    CANDIDATE_ID: candidateId, 
                    PSYCHOLOGIST_ID: psychologistId, 
                    APPOINTMENT_ID: appointmentId, 
                    PAYMENT_METHOD: paymentMethod, 
                    PAYMENT_AMOUNT: amount 
                }),
            });

            const { orderId, currency, amount: paymentAmount } = await response.json();

            // ✅ **Step 2: Open Razorpay Payment**
            const options = {
                key: "your_razorpay_key_id", // Replace with your Razorpay Key ID
                amount: paymentAmount,
                currency: currency,
                name: "Psychometric Evaluation",
                description: "Session Booking Payment",
                order_id: orderId,
                handler: async function (response) {
                    console.log(response);

                    // ✅ **Step 3: Verify Payment Signature on Backend**
                    const verifyRes = await fetch("http://localhost:5000/payment/verify-payment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            ...response,
                            CANDIDATE_ID: candidateId,
                            PSYCHOLOGIST_ID: psychologistId,
                            APPOINTMENT_ID: appointmentId,
                            PAYMENT_METHOD: paymentMethod,
                            PAYMENT_AMOUNT: amount
                        }),
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        alert("Payment successful!");
                    } else {
                        alert("Payment verification failed!");
                    }
                },
                prefill: {
                    name: "John Doe",
                    email: "johndoe@example.com",
                    contact: "9999999999",
                },
                theme: { color: "#3399cc" },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return <button onClick={handlePayment}>Pay Now</button>;
};

export default Checkout;
