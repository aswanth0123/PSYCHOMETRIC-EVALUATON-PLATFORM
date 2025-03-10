const express = require("express");
const db = require("../db"); // Database connection
const router = express.Router();

// ✅ Create Payments Table if not exists
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS payments (
    PAYMENT_ID INT AUTO_INCREMENT PRIMARY KEY,
    CANDIDATE_ID INT NOT NULL,
    PSYCHOLOGIST_ID INT NOT NULL,
    APPOINTMENT_ID INT NOT NULL,
    PAYMENT_METHOD VARCHAR(50) NOT NULL,
    PAYMENT_AMOUNT DECIMAL(10,2) NOT NULL,
    PAYMENT_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CANDIDATE_ID) REFERENCES candidates(ID),
    FOREIGN KEY (PSYCHOLOGIST_ID) REFERENCES psychologist_details(PSYCHOLOGIST_ID),
    FOREIGN KEY (APPOINTMENT_ID) REFERENCES appointments_table(APPOINTMENT_ID)
  )`;

db.query(createTableQuery, (err, result) => {
  if (err) console.error("Error creating payments table:", err);
  else console.log("Payments table is ready");
});

// ✅ GET API - Fetch All Payments
router.get("/", (req, res) => {
  db.query("SELECT * FROM payments", (err, results) => {
    if (err) return res.status(500).json({ error: "Internal Server Error" });
    res.json(results);
  });
});



// ✅ POST API - Add a New Payment
router.post("/", (req, res) => {
  const { CANDIDATE_ID, PSYCHOLOGIST_ID, APPOINTMENT_ID, PAYMENT_METHOD, PAYMENT_AMOUNT } = req.body;

  if (!CANDIDATE_ID || !PSYCHOLOGIST_ID || !APPOINTMENT_ID || !PAYMENT_METHOD || !PAYMENT_AMOUNT) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = "INSERT INTO payments (CANDIDATE_ID, PSYCHOLOGIST_ID, APPOINTMENT_ID, PAYMENT_METHOD, PAYMENT_AMOUNT) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [CANDIDATE_ID, PSYCHOLOGIST_ID, APPOINTMENT_ID, PAYMENT_METHOD, PAYMENT_AMOUNT], (err, result) => {
    if (err) return res.status(500).json({ error: "Internal Server Error" });
    res.status(201).json({ message: "Payment added successfully", payment_id: result.insertId });
  });
});



module.exports = router;
