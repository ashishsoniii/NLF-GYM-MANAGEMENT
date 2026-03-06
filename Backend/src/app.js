require("dotenv").config();

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const dbConfig = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const memberAuthRoutes = require("./routes/memberAuthRoutes");
const planRoutes = require("./routes/planRoutes");
const memberRoutes = require("./routes/memberRoutes");
const statisticsRoutes = require("./routes/statisticsRoutes");

const app = express();
const port = process.env.PORT || 3001;

// Allow all origins (e.g. https://nlfgym.netlify.app) – restrict in production if needed
app.use(
  cors({
    origin: true, // allow any origin (reflects request origin)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

app.use("/auth", authRoutes);
app.use("/member-auth", memberAuthRoutes);
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
  if (err.status === 413 || err.message?.toLowerCase().includes("too large")) {
    return res.status(413).json({ error: "Request body too large. Max 10MB." });
  }
  if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return res.status(400).json({ error: "Invalid JSON in request body. Check for trailing commas or invalid syntax." });
  }
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ error: err.message || "An error occurred" });
});
