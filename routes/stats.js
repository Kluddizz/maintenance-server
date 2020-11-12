const db = require("../db");
const access = require("../express-access");
const express = require("express");
const router = express.Router();

router.get(
  "/state/:stateId",
  access({ roles: ["admin"] }),
  async (req, res) => {
    const { stateId } = req.params;

    const stateQuery = await db.query(
      `
      SELECT COUNT(id)
      FROM appointments
      WHERE stateid = $1
            AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW());
      `,
      [stateId]
    );

    const totalQuery = await db.query(
      `
      SELECT COUNT(id)
      FROM appointments
      WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW());
      `,
      []
    );

    res.status(200).json({
      success: true,
      statistics: {
        total: totalQuery.rows[0]?.count,
        actual: stateQuery.rows[0]?.count,
      },
    });
  }
);

router.get(
  "/user/:userid/state/:stateId",
  access({ dataOwner: (req) => req.params.userid }),
  async (req, res) => {
    const { userid, stateId } = req.params;

    const stateQuery = await db.query(
      `
      SELECT COUNT(id)
      FROM appointments
      WHERE stateid = $1
            AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW())
            AND userid = $2;
      `,
      [stateId, userid]
    );

    const totalQuery = await db.query(
      `
      SELECT COUNT(id)
      FROM appointments
      WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW())
            AND userid = $1;
      `,
      [userid]
    );

    res.status(200).json({
      success: true,
      statistics: {
        total: totalQuery.rows[0]?.count,
        actual: stateQuery.rows[0]?.count,
      },
    });
  }
);

module.exports = router;
