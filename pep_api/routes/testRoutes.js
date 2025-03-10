const express = require("express");
const router = express.Router();
const db = require("../db"); // Import MySQL connection

// Create table if not exists
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS test_details (
        TEST_ID INT AUTO_INCREMENT PRIMARY KEY,
        TEST_NAME VARCHAR(255) NOT NULL,
        TEST_DESCRIPTION TEXT NOT NULL
    )
`;
db.query(createTableQuery, (err) => {
    if (err) {
        console.error("Error creating test_details table:", err);
    } else {
        console.log("test_details table created or already exists.");
    }
});

// ✅ **1. Get all test details (GET)**
router.get("/", (req, res) => {
    db.query("SELECT * FROM test_details", (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// ✅ **2. Insert a new test (POST)**
router.post("/", (req, res) => {
    const { TEST_NAME, TEST_DESCRIPTION } = req.body;

    if (!TEST_NAME || !TEST_DESCRIPTION) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const insertQuery = "INSERT INTO test_details (TEST_NAME, TEST_DESCRIPTION) VALUES (?, ?)";
    db.query(insertQuery, [TEST_NAME, TEST_DESCRIPTION], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ message: "Test added successfully", TEST_ID: result.insertId });
    });
});

// ✅ **3. Update a test by ID (PUT)**
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { TEST_NAME, TEST_DESCRIPTION } = req.body;

    if (!TEST_NAME || !TEST_DESCRIPTION) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const updateQuery = "UPDATE test_details SET TEST_NAME = ?, TEST_DESCRIPTION = ? WHERE TEST_ID = ?";
    db.query(updateQuery, [TEST_NAME, TEST_DESCRIPTION, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Test not found" });
        }
        res.json({ message: "Test updated successfully" });
    });
});

// ✅ **4. Delete a test by ID (DELETE)**
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    const deleteQuery = "DELETE FROM test_details WHERE TEST_ID = ?";
    db.query(deleteQuery, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Test not found" });
        }
        res.json({ message: "Test deleted successfully" });
    });
});

module.exports = router;
