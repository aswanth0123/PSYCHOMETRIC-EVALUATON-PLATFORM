import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Authform.css";

export default function ForgetPassword() {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setErrors({});
        const { name, value } = e.target;
        if (name === "email") setEmail(value);
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

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!validateEmail()) return;

        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/auth/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            setLoading(false);

            if (!response.ok) {
                setErrors({ email: data.error });
            } else {
                setStep(2);
            }
        } catch (error) {
            setLoading(false);
            setErrors({ email: "Server error, please try again." });
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (!validatePassword()) return;

        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, newPassword }),
            });
            const data = await response.json();
            setLoading(false);

            if (!response.ok) {
                setErrors({ newPassword: data.error });
            } else {
                alert("Password reset successfully. Please log in.");
                navigate("/auth");
            }
        } catch (error) {
            setLoading(false);
            setErrors({ newPassword: "Server error, please try again." });
        }
    };

    return (
        <div className="auth-container">
            <div className="form-container">
                <h2>Forget Password</h2>
                {step === 1 ? (
                    <form className="form" onSubmit={handleEmailSubmit}>
                        <input type="email" name="email" placeholder="Enter your email" value={email} onChange={handleChange} required />
                        {errors.email && <p className="error">{errors.email}</p>}
                        <button type="submit" disabled={loading}>{loading ? "Processing..." : "Verify Email"}</button>
                    </form>
                ) : (
                    <form className="form" onSubmit={handlePasswordReset}>
                        <input type="password" name="newPassword" placeholder="Enter new password" value={newPassword} onChange={handleChange} required />
                        {errors.newPassword && <p className="error">{errors.newPassword}</p>}
                        <button type="submit" disabled={loading}>{loading ? "Processing..." : "Reset Password"}</button>
                    </form>
                )}
            </div>
        </div>
    );
}
