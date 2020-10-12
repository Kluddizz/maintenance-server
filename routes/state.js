const express = require("express");
const router = express.Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const query = await db.query(
    `
    SELECT *
    FROM states
    WHERE id = $1;
    `,
    [id]
  );

  if (query.rows.length > 0) {
    res.status(200).json({
      status: 200,
      state: query.rows[0],
    });
  } else {
    res.status(200).json({
      status: 200,
      message: "The requested state does not exist",
    });
  }
});

module.exports = router;
