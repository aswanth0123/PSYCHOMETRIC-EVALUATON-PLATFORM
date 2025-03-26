const express = require("express");
const router = express.Router();
const db = require("../db");

const createTableQuery = `CREATE TABLE IF NOT EXISTS test_responses (
    TEST_RESPONSES_ID INT PRIMARY KEY AUTO_INCREMENT,
    CANDIDATE_ID INT,
    TEST_ID INT,
    QUESTION_ID INT,
    SELECTED_OPTION VARCHAR(255),
    IS_CORRECT BOOLEAN,
    TEST_ATTEND_ID INT,
    FOREIGN KEY (CANDIDATE_ID) REFERENCES candidates(ID),
    FOREIGN KEY (TEST_ID) REFERENCES test_details(TEST_ID),
    FOREIGN KEY (QUESTION_ID) REFERENCES questions(ID),
    FOREIGN KEY (TEST_ATTEND_ID) REFERENCES test_attend(TEST_ATTEND_ID)
)`;

db.query(createTableQuery, (err, result) => {
    if (err) console.error("Error creating test_responses table:", err);
    else console.log("test_responses table is ready");
  });


  router.post("/test-responses", (req, res) => {
    const { CANDIDATE_ID, TEST_ID, QUESTION_ID, SELECTED_OPTION, IS_CORRECT, TEST_ATTEND_ID } = req.body;
    const sql = "INSERT INTO test_responses (CANDIDATE_ID, TEST_ID, QUESTION_ID, SELECTED_OPTION, IS_CORRECT, TEST_ATTEND_ID) VALUES (?, ?, ?, ?, ?,?)";
    
    db.query(sql, [CANDIDATE_ID, TEST_ID, QUESTION_ID, SELECTED_OPTION, IS_CORRECT, TEST_ATTEND_ID], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Response recorded successfully!" });
    });
});


router.get("/:id", (req, res) => {
    const { id } = req.params;
    const sql = `SELECT q.*,tr.*,c.*,t.* FROM test_responses tr
     JOIN candidates c ON tr.CANDIDATE_ID = c.ID 
     JOIN questions q ON tr.QUESTION_ID = q.ID 
     JOIN TEST_DETAILS t ON tr.TEST_ID = t.TEST_ID WHERE TEST_ATTEND_ID = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        // console.log(result);
        
        res.json(result);
    });
});
module.exports = router;