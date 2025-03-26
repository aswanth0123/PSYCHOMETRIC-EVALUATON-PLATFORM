const express = require("express");
const router = express.Router();
const db = require("../db");

const createTableQuery2 = `CREATE TABLE IF NOT EXISTS test_attend(
    TEST_ATTEND_ID INT PRIMARY KEY AUTO_INCREMENT,
    CANDIDATE_ID INT,
    FOREIGN KEY (CANDIDATE_ID) REFERENCES candidates(ID)
    )`;

db.query(createTableQuery2, (err, result) => {
    if (err) console.error("Error creating test_attend table:", err);
    else console.log("test_attend table is ready");
  });


router.post("/test-attend", (req, res) => {
    const { CANDIDATE_ID } = req.body;
    const sql = "INSERT INTO test_attend (CANDIDATE_ID) VALUES (?)";
    
    db.query(sql, [CANDIDATE_ID], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "test_attend created successfully" , TEST_ATTEND_ID: result.insertId });
    });
});


module.exports = router;