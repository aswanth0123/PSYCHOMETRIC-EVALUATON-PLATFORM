import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Authform.css";

export default function ForgetPassword() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setErrors({});
        const { name, value } = e.target;
        if (name === "email") setEmail(value);
        if (name === "otp") setOtp(value);
        if (name === "newPassword") setNewPassword(value);
    };

    const validateEmail = () => {
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrors({ email: "Please enter a valid email." });
            return false;
        }
        return true;
    };

    const validatePassword = () => {
        if (newPassword.length < 8) {
            setErrors({ newPassword: "Password must be at least 8 characters long." });
            return false;
        }
        return true;
    };

    // Send OTP
    const sendOTP = async (e) => {
        e.preventDefault();
        if (!validateEmail()) return;

        setLoading(true);
        try {
            const res = await axios.post("http://localhost:5000/api/admin/send-otp", { email });
            setMessage(res.data.message);
            setStep(2);
        } catch (err) {
            console.log(err.message);
            
            setErrors({ email: "Error sending OTP" });
        }
        setLoading(false);
    };

    // Verify OTP and proceed to password reset
    const verifyOTP = async (e) => {
        e.preventDefault();

        setLoading(true);
        try {
            const res = await axios.post("http://localhost:5000/api/admin/verify-otp", { email, otp });
            setMessage(res.data.message);
            setStep(3);
        } catch (err) {
            setErrors({ otp: "Invalid OTP" });
        }
        setLoading(false);
    };

    // Reset Password
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (!validatePassword()) return;

        setLoading(true);
        try {
            const res = await axios.post("http://localhost:5000/api/admin/reset-password", { email, newPassword });
            setMessage(res.data.message);
            alert("Password reset successfully. Please log in.");
            navigate("/admin");
        } catch (err) {
            setErrors({ newPassword: "Server error, please try again." });
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="form-container">
                <h2>Forget Password</h2>
                {step === 1 && (
                    <form className="form" onSubmit={sendOTP}>
                        <input type="email" name="email" placeholder="Enter your email" value={email} onChange={handleChange} required />
                        {errors.email && <p className="error">{errors.email}</p>}
                        <button type="submit" disabled={loading}>{loading ? "Processing..." : "Send OTP"}</button>
                    </form>
                )}
                {step === 2 && (
                    <form className="form" onSubmit={verifyOTP}>
                        <input type="text" name="otp" placeholder="Enter OTP" value={otp} onChange={handleChange} required />
                        {errors.otp && <p className="error">{errors.otp}</p>}
                        <button type="submit" disabled={loading}>{loading ? "Processing..." : "Verify OTP"}</button>
                    </form>
                )}
                {step === 3 && (
                    <form className="form" onSubmit={handlePasswordReset}>
                        <input type="password" name="newPassword" placeholder="Enter new password" value={newPassword} onChange={handleChange} required />
                        {errors.newPassword && <p className="error">{errors.newPassword}</p>}
                        <button type="submit" disabled={loading}>{loading ? "Processing..." : "Reset Password"}</button>
                    </form>
                )}
                <p>{message}</p>
            </div>
        </div>
    );
}
