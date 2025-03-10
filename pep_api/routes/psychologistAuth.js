const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const router = express.Router();

// 1️⃣ MySQL Database Connection
const db = require('../db');

// 2️⃣ Secret Key for JWT Token   
const SECRET_KEY = process.env.SECRET_KEY; // Replace with a strong secret

// 3️⃣ Psychologist Login API
router.post("/psychologist/login", (req, res) => {
    const { email, password } = req.body;

    // Check if both email and password are provided
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    // Find psychologist by email
    db.query(
        "SELECT * FROM psychologist_details WHERE PSYCHOLOGIST_EMAIL_ID = ?",
        [email],
        async (err, results) => {
            if (err) {
                console.error("❌ Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }

            // If no psychologist found
            if (results.length === 0) {
                return res.status(401).json({ error: "Invalid email or password" });
            }

            const psychologist = results[0];

            // Compare passwords
            const isMatch = await bcrypt.compare(password, psychologist.PSYCHOLOGIST_PASSWORD);

            if (!isMatch) {
                return res.status(401).json({ error: "Invalid email or password" });
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: psychologist.PSYCHOLOGIST_ID, email: psychologist.PSYCHOLOGIST_EMAIL_ID },
                SECRET_KEY,
                { expiresIn: "1h" }
            );

            res.status(200).json({ message: "Login successful", token });
        }
    );
});
router.get("/psychologists", (req, res) => {
    db.query("SELECT * FROM psychologist_details", (err, results) => {
        if (err) return res.status(500).json({ error: "Database error", details: err });
        res.status(200).json(results);
    });
});
module.exports = router;
