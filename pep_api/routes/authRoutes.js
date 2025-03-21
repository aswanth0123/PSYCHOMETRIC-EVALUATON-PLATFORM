const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Create candidates table if not exists
const createTableQuery = `
CREATE TABLE IF NOT EXISTS candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    dob DATE,
    gender ENUM('Male', 'Female') NOT NULL,
    contact_number VARCHAR(10) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL  
);
`;

db.query(createTableQuery, (err) => {
    if (err) console.error("Error creating table:", err.message);
    else console.log("✅ Candidates table is ready.");
});

// User Registration
router.post("/register", async (req, res) => {
    const { firstName, lastName, dob, gender, contactNumber, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        "INSERT INTO candidates (first_name, last_name, dob, gender, contact_number, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [firstName, lastName, dob, gender, contactNumber, email, hashedPassword],
        (err, result) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: "User registered successfully" });
        }
    );
});

// User Login
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM candidates WHERE email = ?", [email], async (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (result.length === 0) return res.status(401).json({ error: "Invalid credentials" });

        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ token, user: { id: user.id, email: user.email,name: user.first_name+" "+user.last_name } });
    });
});

// Verify Email (Forget Password Step 1)
router.post("/verify-email", (req, res) => {
    const { email } = req.body;
    
    db.query("SELECT * FROM candidates WHERE email = ?", [email], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (result.length === 0) return res.status(404).json({ error: "Email not found" });
        
        res.json({ message: "Email verified. Proceed to reset password." });
    });
});

// Reset Password (Forget Password Step 2)
router.post("/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.query("UPDATE candidates SET password = ? WHERE email = ?", [hashedPassword, email], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ message: "Password reset successfully." });
    });
});

// Get User by ID
router.get("/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM candidates WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ error: "User not found" });
        res.json(result[0]);
    });
});

// Update User Profile
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email, contact_number, password } = req.body;
    const sql = "UPDATE candidates SET first_name = ?, last_name = ?, email = ?, contact_number = ?, password = ? WHERE id = ?";
    
    db.query(sql, [first_name, last_name, email, contact_number, password, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "Profile updated successfully" });
    });
});



const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
let otpStorage = {};
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  // Check if email exists in database
  db.query("SELECT * FROM candidates WHERE email = ?", [email], async (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.length === 0) {
      return res.status(400).json({ error: "Email not found!" });
    }
    
    console.log('Sending OTP to:', email);
    
    // Generate OTP
    const otp = crypto.randomInt(1000, 9999).toString();
    otpStorage[email] = otp;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
    };

    console.log('Generated OTP:', otp);

    try {
      let info = await transporter.sendMail(mailOptions);
      console.log("✅ OTP email sent successfully to:", email, "Message ID:", info);
      res.status(200).json({ message: "OTP sent successfully!" });
  } catch (err) {
      console.error("❌ Email sending error:", err);
      res.status(500).json({ error: "Failed to send OTP. Please try again later." });
  }
  
  });
});



router.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    if (otpStorage[email] === otp) {
      delete otpStorage[email]; // Remove OTP after verification
      res.status(200).json({ message: "OTP verified successfully!" });
    } else {
      res.status(400).json({ error: "Invalid OTP" });
    }
  });




module.exports = router;
