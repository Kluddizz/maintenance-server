const express = require("express");
const router = express.Router();

const db = require("../db");

router
  .route("/")
  .get(async (req, res) => {
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
  })
  .put(async (req, res) => {
    const { username, password } = req.body;

    try {
      if (username) {
        await db.query(
          `
          UPDATE users
          SET username = $1
          WHERE id = $2;
        `,
          [username, req.user.id]
        );
      }

      if (password) {
        await db.query(
          `
          UPDATE users
          SET password = crypt($1, gen_salt('bf'))
          WHERE id = $2;
        `,
          [password, req.user.id]
        );
      }

      res.status(200).json({
        success: true,
        message: "Updated user"
      });
    } catch (err) {
      console.log(err);
      res.status(400).json({
        success: false,
        message: "Could not update user"
      });
    }
  });

module.exports = router;
