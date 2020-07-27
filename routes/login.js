const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const appDir = path.dirname(require.main.filename);
const privateKey = fs.readFileSync(`${appDir}/private.key`);

router.route("/").post(async (req, res) => {
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
      username: user.username,
      roleid: user.roleid
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

module.exports = router;
