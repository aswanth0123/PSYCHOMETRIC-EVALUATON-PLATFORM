const express = require("express");
const router = express.Router();
const db = require("../db"); // Using standard mysql2 (no promise)
require("dotenv").config();

// ✅ Create Feedback Table If Not Exists
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS feedback (
    FEEDBACK_ID INT AUTO_INCREMENT PRIMARY KEY,
    CANDIDATE_ID INT NOT NULL,
    FEEDBACK TEXT NOT NULL,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CANDIDATE_ID) REFERENCES candidates(ID) ON DELETE CASCADE
  )`;

db.query(createTableQuery, (err, result) => {
  if (err) console.error("❌ Error creating feedback table:", err);
  else console.log("✅ Feedback table is ready");
});

// ✅ GET API - Fetch All Feedback with Candidate Name
router.get("/", (req, res) => {
  const query = `
    SELECT f.FEEDBACK_ID, f.CANDIDATE_ID, c.first_name AS CANDIDATE_NAME, f.FEEDBACK, f.CREATED_AT
    FROM feedback f
    JOIN candidates c ON f.CANDIDATE_ID = c.ID
    ORDER BY f.CREATED_AT DESC`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
});

// ✅ POST API - Save Feedback
router.post("/", (req, res) => {
  const { candidate_id, feedback } = req.body;

  if (!candidate_id || !feedback) {
    return res.status(400).json({ error: "Candidate ID and Feedback are required" });
  }

  const sql = `INSERT INTO feedback (CANDIDATE_ID, FEEDBACK) VALUES (?, ?)`;
  db.query(sql, [candidate_id, feedback], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: "Feedback submitted successfully", feedback_id: result.insertId });
  });
});


router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM feedback WHERE FEEDBACK_ID = ?";
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: "Feedback deleted successfully" });
    });
  });

  router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { FEEDBACK } = req.body;
    const sql = "UPDATE feedback SET FEEDBACK = ? WHERE FEEDBACK_ID = ?";
    db.query(sql, [FEEDBACK, id], (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: "Feedback updated successfully" });
    });
  })
module.exports = router;
