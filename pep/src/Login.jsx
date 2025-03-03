import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Login.css';
import axios from 'axios'
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [psychologist,setPsychologist] = useState("");
  const navigate = useNavigate(); // Hook to navigate programmatically
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/psychologist/')
        .then(response => setPsychologist(response.data))
        .catch(error => console.log(error));
  }, []);
  const handleLogin = (e) => {
    e.preventDefault();
    console.log('psycolo',psychologist);
    psychologist.map(user=>(user.email === email && user.password === password ? navigate("/psychologist") :alert("Invalid credentials")))
    // TODO: Add authentication logic here
    // if (email === "test@example.com" && password === "password") {
    //   navigate("/dashboard"); // Redirect to Dashboard on successful login
    // } else {
    //   alert("Invalid credentials");
    // }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
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
        <button type="submit" className="login-btn">Login</button>
      </form>
    </div>
  );
};

export default Login;
