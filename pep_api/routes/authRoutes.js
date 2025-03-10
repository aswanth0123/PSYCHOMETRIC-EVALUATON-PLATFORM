const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const createTableQuery = `
CREATE TABLE IF NOT EXISTS candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    dob DATE,
    gender ENUM('Male', 'Female') NOT NULL,
    contact_number VARCHAR(10) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL  -- Hashed password storage
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
                console.error("Database Error:", err); // Log the error
                return res.status(500).json({ error: err.message }); // Send error message
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
        res.json({ token, user: { id: user.id, email: user.email } });
    });
});

module.exports = router;
