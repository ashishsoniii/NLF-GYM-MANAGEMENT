const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const planRoutes = require("./routes/planRoutes");
const memberRoutes = require("./routes/memberRoutes");

var cors = require("cors");

const app = express();
const port = process.env.PORT || 3001;

mongoose.connect("mongodb://127.0.0.1/gym", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());

app.use(cors());

app.use("/auth", authRoutes);
app.use("/plan", planRoutes);
app.use("/member", memberRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/", (req, res) => {
  res.send(`<h1>Home Page</h1>`);
});
