require("dotenv").config();

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const dbConfig = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const planRoutes = require("./routes/planRoutes");
const memberRoutes = require("./routes/memberRoutes");
const statisticsRoutes = require("./routes/statisticsRoutes");

const app = express();
const port = process.env.PORT || 3001;

// Allow all origins for now (restrict FRONTEND_URL in production)
app.use(cors());

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/plan", planRoutes);
app.use("/member", memberRoutes);
app.use("/stat", statisticsRoutes);

dbConfig
  .connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database. Server not started.");
    process.exit(1); 
  });

dbConfig.mongoose.connection.on(
  "error",
  console.error.bind(console, "MongoDB connection error:")
);
app.get("/", (req, res) => {
  res.send(`<h1>Home Page</h1>`);
});

// Global error handler (must be last)
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "Origin not allowed" });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "An error occurred" });
});
