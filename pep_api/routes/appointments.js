const express = require("express");
const router = express.Router();
const db = require("../db"); // Import database connection

// ✅ Create `appointments_table` if it doesn’t exist
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS appointments_table (
        APPOINTMENT_ID INT AUTO_INCREMENT PRIMARY KEY,
        PSYCHOLOGIST_ID INT NOT NULL,
        CANDIDATE_ID INT NOT NULL,
        TEST_ID INT DEFAULT NULL,
        TEST_EVALUATION_ID INT DEFAULT NULL,
        STATUS VARCHAR(50) DEFAULT NULL,
        TIME_SLOT DATETIME NOT NULL,
        FOREIGN KEY (PSYCHOLOGIST_ID) REFERENCES psychologist_details(PSYCHOLOGIST_ID) ON DELETE CASCADE,
        FOREIGN KEY (CANDIDATE_ID) REFERENCES candidates(ID) ON DELETE CASCADE,
        FOREIGN KEY (TEST_ID) REFERENCES test_details(TEST_ID) ON DELETE CASCADE,
        FOREIGN KEY (TEST_EVALUATION_ID) REFERENCES test_evaluation(TEST_EVALUATION_ID) ON DELETE CASCADE
    );
`;

db.query(createTableQuery, (err) => {
    if (err) console.error("Error creating table:", err.message);
    else console.log("✅ Appointments table is ready.");
});

// 📌 POST API: Add an appointment
router.post("/", (req, res) => {
    const { PSYCHOLOGIST_ID, CANDIDATE_ID, TEST_ID, TEST_EVALUATION_ID, TIME_SLOT, STATUS } = req.body;

    // ❌ Check for missing fields
    // if (!PSYCHOLOGIST_ID || !CANDIDATE_ID || !TEST_ID || !TEST_EVALUATION_ID || !TIME_SLOT) {
    //     return res.status(400).json({ error: "All fields are required. Ensure PSYCHOLOGIST_ID is provided." });
    // }
    console.log(TEST_ID, TEST_EVALUATION_ID);
    
    if (TEST_ID  === null || TEST_EVALUATION_ID === null) {
            const sql = `
            INSERT INTO appointments_table (PSYCHOLOGIST_ID, CANDIDATE_ID, TIME_SLOT, STATUS)
            VALUES (?, ?, ?, ?)
        `;

        db.query(sql, [PSYCHOLOGIST_ID, CANDIDATE_ID, TIME_SLOT, STATUS], (err, result) => {
            if (err) {
                console.error("Error inserting appointment:", err);
                return res.status(500).json({ error: "Database error while inserting appointment." });
            }
            res.status(201).json({ message: "Appointment successfully created!", APPOINTMENT_ID: result.insertId });
        });
    }
    else{
        const sql = `
            INSERT INTO appointments_table (PSYCHOLOGIST_ID, CANDIDATE_ID, TEST_ID, TEST_EVALUATION_ID, TIME_SLOT, STATUS)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(sql, [PSYCHOLOGIST_ID, CANDIDATE_ID, TEST_ID, TEST_EVALUATION_ID, TIME_SLOT, STATUS], (err, result) => {
            if (err) {
                console.error("Error inserting appointment:", err);
                return res.status(500).json({ error: "Database error while inserting appointment." });
            }
            res.status(201).json({ message: "Appointment successfully created!", APPOINTMENT_ID: result.insertId });
        });
    }


});

// 📌 GET API: Retrieve all appointments
router.get("/", (req, res) => {
    const query = `
    SELECT 
        a.APPOINTMENT_ID,
        c.first_name AS candidate_first_name,
        c.ID AS candidate_id,
        c.last_name AS candidate_last_name,
        c.contact_number AS candidate_phone,
        c.email AS candidate_email,
        p.PSYCHOLOGIST_ID,
        p.PSYCHOLOGIST_FIRST_NAME AS psychologist_first_name,
        p.PSYCHOLOGIST_LAST_NAME AS psychologist_last_name,
        t.TEST_NAME,
        te.TEST_EVALUATION,
        te.TEST_EVALUATION_ID,
        a.TIME_SLOT,
        a.STATUS
    FROM appointments_table a
    LEFT JOIN candidates c ON a.CANDIDATE_ID = c.ID
    LEFT JOIN psychologist_details p ON a.PSYCHOLOGIST_ID = p.PSYCHOLOGIST_ID
    LEFT JOIN test_details t ON a.TEST_ID = t.TEST_ID
    LEFT JOIN test_evaluation te ON a.TEST_EVALUATION_ID = te.TEST_EVALUATION_ID ORDER BY a.APPOINTMENT_ID DESC
`;
    db.query(query, (err, results) => {
        // console.log(results);
        
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});



router.get("/booked", (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ error: "Date parameter is required." });
    }

    // ✅ Fix: Ensure `TIME_SLOT` is properly formatted
    const sql = `SELECT TIME_SLOT FROM appointments_table WHERE DATE(TIME_SLOT) = ?`;

    db.query(sql, [date], (err, results) => {
        if (err) {
            console.error("❌ Error fetching booked slots:", err);
            return res.status(500).json({ error: "Database error while fetching booked slots." });
        }

        if (!results || results.length === 0) {
            return res.json({ bookedSlots: [] }); // ✅ Handle empty results
        }

        console.log("📅 Fetched booked slots:", results);

        // ✅ Fix: Ensure correct 12-hour format for all time slots
        const bookedTimes = results.map(appointment => {
            return new Date(appointment.TIME_SLOT).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            });
        });

        res.json({ bookedSlots: bookedTimes });
    });
});


router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { STATUS } = req.body;
    const sql = 'UPDATE appointments_table SET STATUS = ? WHERE APPOINTMENT_ID = ?';
    db.query(sql, [STATUS, id], (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: 'Status updated successfully' });
    });
  });




module.exports = router;
