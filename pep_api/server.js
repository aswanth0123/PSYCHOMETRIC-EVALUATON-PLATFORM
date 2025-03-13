const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
// app.use(express.static("../pep/dist"))

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

const psychologistRoutes = require("./routes/psychologistAuth");
app.use("/api", psychologistRoutes);

const testRoutes = require("./routes/testRoutes");
app.use("/api/tests", testRoutes);

const testEvaluationRoutes = require("./routes/testEvaluationRoutes");
app.use("/api/test-evaluations", testEvaluationRoutes);

const appointmentsRoutes = require("./routes/appointments");
app.use("/api/appointments", appointmentsRoutes);

const paymentsRoutes = require("./routes/payments");
app.use("/api/payments", paymentsRoutes);

const questionsRoutes = require("./routes/questions");
app.use("/api/questions", questionsRoutes);



// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../pep/dist/index.html'));
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
