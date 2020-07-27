const express = require("express");
const router = express.Router();

const db = require("../db");

router
  .get("/", async (req, res) => {
    if (req.user.roleId === 1) {
      const query = await db.query(
        `
          SELECT *
          FROM maintenances
          WHERE userId = $1;
        `,
        [req.user.id]
      );

      res.status(200).json({
        success: true,
        message: "Fetched maintenances for the requesting user",
        maintenances: query.rows
      });
    } else if (req.user.roleId === 0) {
      const query = await db.query(
        `
          SELECT *
          FROM maintenances;
        `,
        []
      );

      res.status(200).json({
        success: true,
        message: "Fetched all maintenances",
        maintenances: query.rows
      });
    }
  })
  .get("/:id", async (req, res) => {
    const { id } = req.params;

    const query = await db.query(
      `
      SELECT *
      FROM maintenances
      WHERE userId = $1
            AND id = $2;
    `,
      [req.user.id, id]
    );

    if (query.rows.length === 1) {
      res.status(200).json({
        success: true,
        message: "Fetched maintenance",
        maintenance: query.rows[0]
      });
    } else {
      res.status(400).json({
        success: false,
        message:
          "There is no maintenance entry for the requesting user with the given ID"
      });
    }
  });

module.exports = router;
