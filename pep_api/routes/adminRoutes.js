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
            admin: admin
        });
    });
});

router.put("/update-admin/:id", (req, res) => {
    const adminId = req.params.id;
    const { ADMIN_FIRST_NAME, ADMIN_LAST_NAME, ADMIN_CONTACT_NO, ADMIN_EMAIL_ID } = req.body;
  
    const sql = `UPDATE admin_details SET 
      ADMIN_FIRST_NAME = ?, 
      ADMIN_LAST_NAME = ?, 
      ADMIN_CONTACT_NO = ?, 
      ADMIN_EMAIL_ID = ? 
      WHERE ADMIN_ID = ?`;
  
    db.query(sql, [ADMIN_FIRST_NAME, ADMIN_LAST_NAME, ADMIN_CONTACT_NO, ADMIN_EMAIL_ID, adminId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Admin updated successfully" });
    });
  });


router.get("/:id", (req, res) => {
    const psychologistId = req.params.id;
    const sql = "SELECT * FROM admin_details WHERE ADMIN_ID = ?";
  
    db.query(sql, [psychologistId], (err, result) => {
      if (err) return res.status(500).json({ error: "Database error", details: err });
  
      if (result.length === 0) {
        return res.status(404).json({ message: "Psychologist not found" });
      }
      res.json(result[0]);
    });
  });






// Verify Email (Forget Password Step 1)
router.post("/verify-email", (req, res) => {
    const { email } = req.body;
    
    db.query("SELECT * FROM admin_details WHERE ADMIN_EMAIL_ID = ?", [email], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (result.length === 0) return res.status(404).json({ error: "Email not found" });
        
        res.json({ message: "Email verified. Proceed to reset password." });
    });
});

// Reset Password (Forget Password Step 2)
router.post("/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.query("UPDATE admin_details SET ADMIN_PASSWORD = ? WHERE ADMIN_EMAIL_ID = ?", [hashedPassword, email], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ message: "Password reset successfully." });
    });
});

module.exports = router;
