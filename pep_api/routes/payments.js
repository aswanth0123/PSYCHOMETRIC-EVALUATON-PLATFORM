const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
require("dotenv").config();
const mysql = require("mysql2/promise"); // ✅ Using mysql2/promise
const axios = require("axios");
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ Create Payments Table if not exists
(async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS payments (
        PAYMENT_ID INT AUTO_INCREMENT PRIMARY KEY,
        CANDIDATE_ID INT NOT NULL,
        PSYCHOLOGIST_ID INT NOT NULL,
        APPOINTMENT_ID INT NULL,
        PAYMENT_METHOD VARCHAR(50) NOT NULL,
        PAYMENT_AMOUNT DECIMAL(10,2) NOT NULL,
        PAYMENT_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (CANDIDATE_ID) REFERENCES candidates(ID),
        FOREIGN KEY (PSYCHOLOGIST_ID) REFERENCES psychologist_details(PSYCHOLOGIST_ID),
        FOREIGN KEY (APPOINTMENT_ID) REFERENCES appointments_table(APPOINTMENT_ID)
      )`;
    await db.query(createTableQuery);
    console.log("✅ Payments table is ready");
  } catch (err) {
    console.error("❌ Error creating payments table:", err);
  }
})();

// ✅ GET API - Fetch All Payments
router.get("/", async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT p.*, c.first_name, c.last_name as name, psy.PSYCHOLOGIST_FIRST_NAME, psy.PSYCHOLOGIST_LAST_NAME
      FROM payments p
      JOIN candidates c ON p.CANDIDATE_ID = c.ID
      JOIN psychologist_details psy ON p.PSYCHOLOGIST_ID = psy.PSYCHOLOGIST_ID
    `);
    res.json(results);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Razorpay Configuration
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Your Razorpay Key ID
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Your Razorpay Secret Key
});

// ✅ Create Razorpay Order
router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Save Payment Details
router.post("/save-payment", async (req, res) => {
  try {
    const { candidate_id, psychologist_id, appointment_id, payment_method, payment_amount } = req.body;

    console.log("Received Data:", req.body);

    const sql = `INSERT INTO payments (CANDIDATE_ID, PSYCHOLOGIST_ID, APPOINTMENT_ID, PAYMENT_METHOD, PAYMENT_AMOUNT) VALUES (?, ?, ?, ?, ?)`;
    const values = [candidate_id, psychologist_id, appointment_id, payment_method, payment_amount];

    console.log("Executing SQL:", sql);
    console.log("Values:", values);

    const [result] = await db.query(sql, values);
    console.log("DB Insert Result:", result);

    res.json({ success: true, message: "Payment saved successfully", payment_id: result.insertId });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/get-payment-method/:paymentId", async (req, res) => {
  const paymentId = req.params.paymentId;
  const razorpayKey = "rzp_test_MrmbaBWocQQF0J";
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET; // Replace with your Razorpay Secret Key

  try {
      const auth = Buffer.from(`${razorpayKey}:${razorpaySecret}`).toString("base64");
      const response = await axios.get(`https://api.razorpay.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Basic ${auth}` },
      });

      return res.json({ method: response.data.method }); // Sends the payment method (UPI, Card, etc.)
  } catch (error) {
      console.error("Error fetching payment details:", error);
      return res.status(500).json({ error: "Failed to retrieve payment method" });
  }
});



module.exports = router;
