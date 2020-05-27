const express = require("express");
const exprjwt = require("express-jwt");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const db = require("./db");

const port = process.env.PORT || 5050;
const privateKey = fs.readFileSync(`${__dirname}/private.key`);
const publicKey = fs.readFileSync(`${__dirname}/public.key`);

const app = express();
app.use("/users", exprjwt({ secret: publicKey }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());
app.use(cors());

app.post("/login", async (req, res) => {
	const { username, password } = req.body;

	const query = await db.query(
		`
    SELECT *
    FROM users
    WHERE username = $1
          AND password = crypt($2, password);
  `,
		[username, password]
	);

	if (query.rows.length === 1) {
		const user = query.rows[0];

		const payload = {
			id: user.id,
			username: user.username
		};

		const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });

		res.status(200).json({
			success: true,
			message: "Authentication successful",
			token: token
		});
	} else {
		res.status(403).json({
			success: false,
			message: "Authentication failed"
		});
	}
});

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
