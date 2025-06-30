require('dotenv').config(); // To Load The Enviorment File 
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");
const app = express();
const cors = require('cors');
const session = require('express-session');
//just to load the File
require('./config/passport'); 

// Connect to MongoDB
const db = require("./config/keys").mongoURL;
mongoose
  .connect(db)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

//This will allow requests from your React frontend (running on port 5173) to communicate with your Express backend (running on port 5000).
app.use(cors());



// Use body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// passport middleware
app.use(passport.initialize());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

//passport configure
require("./config/passport")(passport);

// user routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
