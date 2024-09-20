const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const planRoutes = require("./routes/planRoutes");
const memberRoutes = require("./routes/memberRoutes");
const statisticsRoutes = require("./routes/statisticsRoutes");
const dbConfig = require("./config/database"); // Import the database configuration

require("dotenv").config();

var cors = require("cors");

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.use(cors());

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
