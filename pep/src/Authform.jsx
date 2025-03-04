import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import { Link } from "react-router-dom";
import "./Authform.css"; // Import CSS file
import axios from 'axios'
export default function AuthForm() {
    const [isLogin, setIsLogin] = useState(true); // Toggle between login & signup
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        dob: "",
        gender: "",
        contactNumber: "",
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [candidate,setCandidate] = useState("");
    const navigate = useNavigate(); // Hook to navigate programmatically
    useEffect(() => {
      axios.get('http://127.0.0.1:8000/api/candidate/')
          .then(response => setCandidate(response.data))
          .catch(error => console.log(error));
    }, []);
    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Validate input fields
    const validate = () => {
        const newErrors = {};

        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email (e.g., user@example.com).";
        }
        if (!formData.password.trim()) {
            newErrors.password = "Password is required.";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters long.";
        }

        if (!isLogin) {
            // Signup-specific validation
            if (!formData.first_name || !/^[a-zA-Z]+$/.test(formData.first_name)) {
                newErrors.first_name = "First Name should only contain alphabets.";
            }
            if (!formData.last_name || !/^[a-zA-Z]+$/.test(formData.last_name)) {
                newErrors.last_name = "Last Name should only contain alphabets.";
            }
            if (!formData.gender) {
                newErrors.gender = "Gender is required.";
            }
            if (!formData.contactNumber || !/^\d{10}$/.test(formData.contactNumber)) {
                newErrors.contactNumber = "Contact Number must be exactly 10 digits.";
            }
        }
        return newErrors;
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            setErrors({});

            if (isLogin) {
               
                candidate.map(user=>{
                    if(user.email === formData.email && user.password === formData.password) {
                        navigate("/dashboard")
                        sessionStorage.setItem("user", JSON.stringify(user));
                    }  })

                // if (formData.email === validEmail && formData.password === validPassword) {
                //     alert("Login successful!");

                //     navigate("/dashboard"); // Redirect to dashboard
                // } else {
                //     setErrors({ email: "Invalid email or password." });
                // }
            } else {
                // const {first_name,last_name,dob,gender,contact_no,email,password} = formData
                // axios.post('http://localhost:8000/api/cadidate/', {first_name, last_name ,dob,gender,contact_no,email,password })
                axios.post('http://localhost:8000/api/candidate/', formData)
                .then(response => {
                    console.log(response.data);
                    setFormData({first_name: "",
                        last_name: "",
                        dob: "",
                        gender: "",
                        contactNumber: "",
                        email: "",
                        password: ""})
                        alert("Signup successful! Redirecting to login...");
                        setIsLogin(true);       
                })
                .catch(error => console.log(error));
                
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="form-container">
                <div className="form-toggle">
                    <button className={isLogin ? "active" : ""} onClick={() => setIsLogin(true)}>Login</button>
                    <button className={!isLogin ? "active" : ""} onClick={() => setIsLogin(false)}>SignUp</button>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    <h2>{isLogin ? "Login" : "Sign Up"}</h2>

                    {!isLogin && (
                        <>
                            <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} />
                            {errors.first_name && <p className="error">{errors.first_name}</p>}

                            <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} />
                            {errors.last_name && <p className="error">{errors.last_name}</p>}

                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                            {errors.dob && <p className="error">{errors.dob}</p>}

                            <div className="gender-container">
                                <label>
                                    <input type="radio" name="gender" value="Male" onChange={handleChange} /> Male
                                </label>
                                <label>
                                    <input type="radio" name="gender" value="Female" onChange={handleChange} /> Female
                                </label>
                            </div>
                            {errors.gender && <p className="error">{errors.gender}</p>}

                            <input type="text" name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleChange} />
                            {errors.contactNumber && <p className="error">{errors.contactNumber}</p>}
                        </>
                    )}

                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                    {errors.email && <p className="error">{errors.email}</p>}

                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
                    {errors.password && <p className="error">{errors.password}</p>}

                    <button type="submit">{isLogin ? "Login" : "SignUp"}</button>
                </form>

                <Link to="/" className="btn btn-secondary">Back to Home</Link>
            </div>
        </div>
    );
}