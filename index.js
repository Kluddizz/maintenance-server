const express = require("express");
const exprjwt = require("express-jwt");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const fs = require("fs");
const db = require("./db");
const login = require("./routes/login");

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

app.get("/users", async (req, res) => {
  const query = await db.query(
    `
		SELECT username,
					 firstname,
					 lastname,
					 roleid
		FROM users
		WHERE id = $1;
	`,
    [req.user.id]
  );

  if (query.rows.length === 1) {
    res.status(200).json({
      success: true,
      message: "Fetched user",
      user: query.rows[0]
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Authentication error"
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});
