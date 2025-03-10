const express = require("express");
const router = express.Router();
const db = require("../db"); // Import MySQL connection

const createTableQuery = `CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_text TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_option VARCHAR(10) NOT NULL,
    test_id INT NOT NULL,
    FOREIGN KEY (test_id) REFERENCES test_details(TEST_ID)
);
`;


db.query(createTableQuery, (err, result) => {
    if (err) console.error("Error creating payments table:", err);
    else console.log("question table is ready");
  });
// ✅ Add a new question
router.post("/add", (req, res) => {
    const { question_text, option_a, option_b, option_c, option_d, correct_option,test_id } = req.body;

    if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const query = `
        INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_option,test_id)
        VALUES (?,?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [question_text, option_a, option_b, option_c, option_d, correct_option,test_id], (err, result) => {
        if (err) {
            console.error("Error inserting question:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.status(201).json({ message: "Question added successfully", questionId: result.insertId });
    });
});

// ✅ Get all questions
router.get("/", (req, res) => {
    db.query("SELECT * FROM questions", (err, results) => {
        if (err) {
            console.error("Error fetching questions:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });
});

module.exports = router;
