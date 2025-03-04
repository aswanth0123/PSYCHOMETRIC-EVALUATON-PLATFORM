import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Login.css';
import axios from 'axios'
const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate(); // Hook to navigate programmatically
  const handleLogin = (e) => {
    e.preventDefault();

    try {
      const response = axios.post("http://127.0.0.1:8000/api/login/", {
        username,
        password,
      });

    //   setMessage(response.data.message);
      console.log("Login successful:", response.data);
      navigate('/AdminDashboard')
    } catch (error) {
      setMessage("Invalid username or password");
      console.error("Login error:", error.response?.data || error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-btn">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
