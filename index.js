const express = require("express");
const exprjwt = require("express-jwt");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const fs = require("fs");
const db = require("./db");

const login = require("./routes/login");
const users = require("./routes/users");

const port = process.env.PORT || 5050;
const publicKey = fs.readFileSync(`${__dirname}/public.key`);

const app = express();
app.use("/users", exprjwt({ secret: publicKey }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());
app.use(cors());

app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(403).json({
      success: false,
      message: "Unauthorized"
    });
  }
});

app.use("/login", login);
app.use("/users", users);

app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});
