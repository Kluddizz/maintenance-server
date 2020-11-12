const db = require("../db");
const access = require("../express-access");
const express = require("express");
const router = express.Router();

router.post(
  "/maintenance/:id",
  access({ roles: ["admin"] }),
  async (req, res) => {
    const { date, maintenanceid, stateid } = req.body;

    await db.query(
      `
      INSERT INTO appointments (date, maintenanceid, stateid)
      VALUES ($1, $2, $3);
      `,
      [date, maintenanceid, stateid]
    );

    res.status(200).json({
      success: true,
      message: "New appointment was inserted",
    });
  }
);

router.put("/:id", access({ roles: ["admin"] }), async (req, res) => {
  const { id } = req.params;
  const { date, stateid, userid } = req.body;

  await db.query(
    `
      UPDATE appointments
      SET date = $1, stateid = $2, userid = $3
      WHERE id = $4;
      `,
    [date, stateid, userid, id]
  );

  res.status(200).json({
    success: true,
    message: "Appointment has been updated",
  });
});

router.get(
  "/maintenance/:id",
  access({ roles: ["admin"] }),
  async (req, res) => {
    const { id } = req.params;

    const query = await db.query(
      `
    SELECT appointments.*,
           maintenances.name,
           states.name as state_name,
           states.color as state_color
    FROM maintenances
    LEFT JOIN appointments
      ON maintenances.id = appointments.maintenanceid
    LEFT JOIN states
      ON appointments.stateid = states.id
    WHERE maintenances.id = $1
    ORDER BY date DESC;
    `,
      [id]
    );

    res.status(200).json({
      success: true,
      appointments: query.rows,
    });
  }
);

module.exports = router;
