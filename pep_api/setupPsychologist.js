const bcrypt = require("bcrypt");

// Create MySQL connection
const db = require("./db");

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err);
        return;
    }
    console.log("✅ Connected to MySQL");

    // Step 1: Create the table
    createPsychologistTable();
});

// Function to create the `psychologist_details` table
function createPsychologistTable() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS psychologist_details (
            PSYCHOLOGIST_ID INT AUTO_INCREMENT PRIMARY KEY,
            PSYCHOLOGIST_FIRST_NAME VARCHAR(50) NOT NULL,
            PSYCHOLOGIST_LAST_NAME VARCHAR(50) NOT NULL,
            PSYCHOLOGIST_DOB DATE NOT NULL,
            PSYCHOLOGIST_GENDER ENUM('Male', 'Female', 'Other') NOT NULL,
            PSYCHOLOGIST_CONTACT_NO VARCHAR(15) NOT NULL UNIQUE,
            PSYCHOLOGIST_EMAIL_ID VARCHAR(100) NOT NULL UNIQUE,
            PSYCHOLOGIST_PASSWORD VARCHAR(255) NOT NULL,
            PSYCHOLOGIST_CERTIFICATIONS TEXT NOT NULL
        )
    `;

    db.query(createTableQuery, (err) => {
        if (err) {
            console.error("❌ Error creating psychologist table:", err);
            return;
        }
        console.log("✅ Psychologist table is ready.");
        insertDefaultPsychologist(); // Step 2: Insert default psychologist
    });
}

// Function to insert a default psychologist
async function insertDefaultPsychologist() {
    const firstName = "pshycologist";
    const lastName = "abc";
    const dob = "1980-05-15";
    const gender = "Male";
    const contactNo = "9876543210";
    const email = "pshycologist@example.com";
    const password = "Psychologist@123";
    const certifications = "Certified Clinical Psychologist, PhD in Psychology";

    // Check if the psychologist already exists
    db.query("SELECT * FROM psychologist_details WHERE PSYCHOLOGIST_EMAIL_ID = ?", [email], async (err, results) => {
        if (err) {
            console.error("❌ Database error:", err);
            return;
        }
        if (results.length > 0) {
            console.log("ℹ️ Default psychologist already exists, skipping insertion.");
            db.end();
            return;
        }

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the default psychologist
        const insertQuery = `
            INSERT INTO psychologist_details 
            (PSYCHOLOGIST_FIRST_NAME, PSYCHOLOGIST_LAST_NAME, PSYCHOLOGIST_DOB, PSYCHOLOGIST_GENDER, PSYCHOLOGIST_CONTACT_NO, PSYCHOLOGIST_EMAIL_ID, PSYCHOLOGIST_PASSWORD, PSYCHOLOGIST_CERTIFICATIONS) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(insertQuery, [firstName, lastName, dob, gender, contactNo, email, hashedPassword, certifications], (err) => {
            if (err) {
                console.error("❌ Error inserting default psychologist:", err);
            } else {
                console.log("✅ Default psychologist added successfully.");
            }
            db.end(); // Close connection
        });
    });
}
