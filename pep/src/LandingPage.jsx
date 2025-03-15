import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import illustration from './assets/illustration.png'
import axios from 'axios';
const LandingPage = () => {
    const [tests, setTests] = useState([]);
    const [feedback,setFeedback] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:5000/api/tests')
        .then(response => {
            setTests(response.data);
        })
        .catch(error => {
            console.error('Error fetching tests:', error);
        });

        axios.get('http://localhost:5000/api/feedback')
        .then(response => {
            const latestFeedback = response.data.slice(-4); // Get the last 4 items
            setFeedback(latestFeedback.reverse());
        })
        .catch(error => {
            logger.error('Error fetching feedback:', error);
        })
        
    },[])
    // console.log(feedback);
    
    return (
        <div className="landing-page">
            {/* Header Section */}
            <header className="header">
                <nav className="nav">
                    <div className="logo">PHYCOLINC</div>
                    <div className="nav-links">
                        <a href="#overview">Home</a>
                        <a href="#benefits">Benefits</a>
                        <a href="#tests">Tests</a>
                        <a href="#appointments">Appointments</a>
                        <a href="#feedback">Feedback</a> {/* Link to feedback */}
                        <a href="#contact">Contact Us</a>
                    </div>
                    <div className="auth-buttons">
                        <Link to="/auth" className="btn btn-light">Login</Link>
                        <Link to="/auth" className="btn btn-dark">Sign Up</Link>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section id="overview" className="hero">
                <div className="hero-content">
                    <h1>Psychometric Evaluation Platform</h1>
                    <p>Discover a cutting-edge platform designed to streamline psychometric evaluations for candidates.</p>
                    <p>Take scientifically backed psychometric tests to uncover your strengths, preferences, and growth areas.</p>
                    <p>Book appointments with psychologists and gain personalized insights to achieve your goals.</p>
                </div>
                <div className="hero-image">
                    <img src={illustration} alt="Psychometric Illustration" />
                </div>
            </section>

            {/* Benefits Section */}
            <section id="benefits" className="benefits">
                <h2>Benefits of Psychometric Testing</h2>
                <div className="benefits-list">
                    <div className="benefit-item">
                        <h3>Self-Awareness</h3>
                        <p>Gain a deeper understanding of your personality, strengths, and areas for growth.</p>
                    </div>
                    <div className="benefit-item">
                        <h3>Career Guidance</h3>
                        <p>Discover the best career paths suited to your abilities and interests.</p>
                    </div>
                    <div className="benefit-item">
                        <h3>Improved Decision Making</h3>
                        <p>Make informed decisions in both your personal and professional life.</p>
                    </div>
                    <div className="benefit-item">
                        <h3>Enhanced Emotional Intelligence</h3>
                        <p>Improve your interpersonal relationships by understanding and managing your emotions.</p>
                    </div>
                </div>
            </section>

            {/* Tests Section */}
            <section id="tests" className="tests">
                <h2>Available Tests</h2>
                <div className="tests-grid">
                    {tests.map((test) => (
                        <div key={test.id} className="test-item">
                            <h3>{test.TEST_NAME}</h3>
                            <p>{test.TEST_DESCRIPTION}</p>
                        </div>
                    ))}
                    {/* <div className="test-item">
                        <h3>Emotional Intelligence</h3>
                        <p>Assess your ability to understand and manage emotions.</p>
                    </div> */}

                </div>
            </section>

            {/* Appointments Section */}
            <section id="appointments" className="appointments">
                <h2>Book a Consultation</h2>
                <p>Get expert guidance from our Psychologist to help you interpret your test results and plan actionable steps for personal or professional growth.</p>

                <div className="appointment-details">
                    <div className="step">
                        <h3>Step 1: Select a Convenient Time</h3>
                        <p>Pick a date and time that fits your schedule using our easy-to-use booking calendar.</p>
                    </div>
                    <div className="step">
                        <h3>Step 2: Make a Payment</h3>
                        <p>Complete the booking process by making a secure online payment.</p>
                    </div>
                </div>

                <div className="appointment-info">
                    <h3>Why Book a Consultation?</h3>
                    <ul>
                        <li>Personalized feedback on your psychometric test results</li>
                        <li>Actionable advice for personal and professional growth</li>
                        <li>Guidance from certified professional</li>
                    </ul>
                </div>

                <button className="btn btn-primary">Book Now</button>
            </section>

            {/* Feedback Section */}
            <section id="feedback" className="feedback">
                <h2>What Our Users Say</h2>
                <p>Here are some of the valuable feedback from our users:</p>

                <div className="feedback-list">
                    {feedback.length == 0 && <p>No feedback available.</p>}
                    {feedback.map((feed)=>(
                    <div key={feed.FEEDBACK_ID} className="feedback-item">
                        <p><strong>{feed.CANDIDATE_NAME} </strong> - "{feed.FEEDBACK}"</p>
                    </div>
                    ))}



                </div>
            </section>

            {/* Contact Us Section */}
            <section id="contact" className="contact">
                <h2>Contact Us</h2>
                <p>If you have any questions or need support, feel free to reach out to us!</p>
                <div className="contact-info">
                    <p><strong>Email:</strong> support@phycolinc.com</p>
                    <p><strong>Phone:</strong> +91 98765 43210</p>
                    <p><strong>Address:</strong> 123 Psychometric Tower, Chandkheda, Ahmedabad</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <p>&copy; 2025 Psychometric Evaluation Platform. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
