const express = require("express");
const db = require("../db"); // Database connection
const router = express.Router();
const Razorpay = require("razorpay");
require("dotenv").config();
const crypto = require("crypto");

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



const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Your Razorpay Key ID
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Your Razorpay Secret Key
});

// ✅ **Create Razorpay Order**
router.post("/create-order", async (req, res) => {
  const { CANDIDATE_ID, PSYCHOLOGIST_ID, APPOINTMENT_ID, PAYMENT_METHOD, PAYMENT_AMOUNT } = req.body;

  if (!CANDIDATE_ID || !PSYCHOLOGIST_ID || !APPOINTMENT_ID || !PAYMENT_METHOD || !PAYMENT_AMOUNT) {
      return res.status(400).json({ error: "All fields are required" });
  }

  try {
      const options = {
          amount: PAYMENT_AMOUNT * 100, // Convert amount to paise (1 INR = 100 paise)
          currency: "INR",
          receipt: `order_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);

      res.json({
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          CANDIDATE_ID,
          PSYCHOLOGIST_ID,
          APPOINTMENT_ID,
          PAYMENT_METHOD
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// ✅ **Verify Payment and Store in Database**
router.post("/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, CANDIDATE_ID, PSYCHOLOGIST_ID, APPOINTMENT_ID, PAYMENT_METHOD, PAYMENT_AMOUNT } = req.body;

  const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

  if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
  }

  // ✅ **Insert Payment Record in Database**
  const sql = `INSERT INTO payments (CANDIDATE_ID, PSYCHOLOGIST_ID, APPOINTMENT_ID, PAYMENT_METHOD, PAYMENT_AMOUNT, RAZORPAY_PAYMENT_ID) VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [CANDIDATE_ID, PSYCHOLOGIST_ID, APPOINTMENT_ID, PAYMENT_METHOD, PAYMENT_AMOUNT, razorpay_payment_id], (err, result) => {
      if (err) return res.status(500).json({ error: "Database Error" });

      res.status(201).json({ success: true, message: "Payment verified and stored successfully", payment_id: result.insertId });
  });
});



module.exports = router;
