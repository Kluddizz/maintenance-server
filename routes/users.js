const express = require("express");
const router = express.Router();

const db = require("../db");

router.get("/", async (req, res) => {
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

module.exports = router;
