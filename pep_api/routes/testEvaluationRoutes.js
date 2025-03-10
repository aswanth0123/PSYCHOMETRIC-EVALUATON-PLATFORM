const express = require("express");
const router = express.Router();
const db = require("../db"); // Import MySQL connection

// Create table if not exists
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS test_evaluation (
        TEST_EVALUATION_ID INT AUTO_INCREMENT PRIMARY KEY,
        CANDIDATE_ID INT NOT NULL,
        TEST_ID INT NOT NULL,
        TEST_EVALUATION TEXT NOT NULL,
        FOREIGN KEY (CANDIDATE_ID) REFERENCES candidates(ID) ON DELETE CASCADE,
        FOREIGN KEY (TEST_ID) REFERENCES test_details(TEST_ID) ON DELETE CASCADE
    )
`;
db.query(createTableQuery, (err) => {
    if (err) {
        console.error("Error creating test_evaluation table:", err);
    } else {
        console.log("test_evaluation table created or already exists.");
    }
});

// ✅ **1. Get all test evaluations (GET)**
router.get("/", (req, res) => {
    db.query(
        `SELECT te.TEST_EVALUATION_ID,c.ID, c.first_name, c.last_name, t.TEST_NAME, te.TEST_EVALUATION
         FROM test_evaluation te
         JOIN candidates c ON te.CANDIDATE_ID = c.ID
         JOIN test_details t ON te.TEST_ID = t.TEST_ID`,
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(results);
        }
    );
});

// ✅ **2. Insert a new test evaluation (POST)**
router.post("/", (req, res) => {
    const { CANDIDATE_ID, TEST_ID, TEST_EVALUATION } = req.body;

    if (!CANDIDATE_ID || !TEST_ID || !TEST_EVALUATION) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const insertQuery = "INSERT INTO test_evaluation (CANDIDATE_ID, TEST_ID, TEST_EVALUATION) VALUES (?, ?, ?)";
    db.query(insertQuery, [CANDIDATE_ID, TEST_ID, TEST_EVALUATION], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ message: "Test evaluation added successfully", TEST_EVALUATION_ID: result.insertId });
    });
});

module.exports = router;
