const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;   // Change this to a strong secret key

// Database connection
const db = require("../db");


// Admin Login API
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    db.query("SELECT * FROM admin_details WHERE ADMIN_EMAIL_ID = ?", [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const admin = results[0];
        const passwordMatch = await bcrypt.compare(password, admin.ADMIN_PASSWORD);

        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate a token
        const token = jwt.sign({ adminId: admin.ADMIN_ID, email: admin.ADMIN_EMAIL_ID }, SECRET_KEY, { expiresIn: "2h" });

        res.status(200).json({
            message: "Admin login successful",
            token: token,
            admin: {
                id: admin.ADMIN_ID,
                firstName: admin.ADMIN_FIRST_NAME,
                lastName: admin.ADMIN_LAST_NAME,
                email: admin.ADMIN_EMAIL_ID,
            }
        });
    });
});

module.exports = router;
