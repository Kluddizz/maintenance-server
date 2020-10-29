const db = require("../db");
const access = require("../express-access");
const express = require("express");
const router = express.Router();

router.get("/", access({ roles: ["admin"] }), async (req, res) => {
  const query = await db.query(
    `
    SELECT *
    FROM appointments;
    `,
    []
  );

  res.status(200).json({
    success: true,
    appointments: query.rows    
  });
});

module.exports = router;