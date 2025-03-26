import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // To handle error messages
  const navigate = useNavigate(); // Hook to navigate programmatically

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data);
        
        localStorage.setItem("token", data.token); // Store token in localStorage
        sessionStorage.setItem("admin", JSON.stringify(data.admin));
        alert("Login Successful!");
        navigate("/AdminDashboard"); // Redirect to Dashboard on successful login
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h2 style={{color:"blue"}}>PHYCOLINC</h2>
      <h2>Admin Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {/* <a href="/AdminForgetPassword" style={{textDecoration:"none"}}>Forget Password</a> */}
        <button type="submit" className="login-btn" style={{marginTop:"10px"}}>Login</button>
      </form>
    </div>
  );
};

export default Login;
