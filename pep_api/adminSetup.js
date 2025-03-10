const mysql = require("mysql");
const bcrypt = require("bcrypt");

// Database connection
const db = require("./db");

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL");

    createAdminTable();
});

// Function to create admin table if not exists
function createAdminTable() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS admin_details (
            ADMIN_ID INT AUTO_INCREMENT PRIMARY KEY,
            ADMIN_FIRST_NAME VARCHAR(50) NOT NULL,
            ADMIN_LAST_NAME VARCHAR(50) NOT NULL,
            ADMIN_CONTACT_NO VARCHAR(15) NOT NULL,
            ADMIN_EMAIL_ID VARCHAR(100) UNIQUE NOT NULL,
            ADMIN_PASSWORD VARCHAR(255) NOT NULL
        )
    `;

    db.query(createTableQuery, (err) => {
        if (err) {
            console.error("Error creating admin table:", err);
            return;
        }
        console.log("Admin table ready.");
        addAdmin(); // Call function to insert admin
    });
}

// Function to insert an admin without user input
async function addAdmin() {
    const firstName = "Admin";
    const lastName = "User";
    const contactNo = "9876543210";
    const email = "admin@example.com";
    const password = "Admin@123";

    db.query("SELECT * FROM admin_details WHERE ADMIN_EMAIL_ID = ?", [email], async (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return;
        }
        if (results.length > 0) {
            console.log("Admin already exists, skipping insertion.");
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            "INSERT INTO admin_details (ADMIN_FIRST_NAME, ADMIN_LAST_NAME, ADMIN_CONTACT_NO, ADMIN_EMAIL_ID, ADMIN_PASSWORD) VALUES (?, ?, ?, ?, ?)",
            [firstName, lastName, contactNo, email, hashedPassword],
            (err) => {
                if (err) {
                    console.error("Error inserting admin:", err);
                } else {
                    console.log("Admin added successfully.");
                }
                db.end(); // Close connection
            }
        );
    });
}
