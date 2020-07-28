const express = require("express");
const access = require("../express-access");
const router = express.Router();

const db = require("../db");

router.get(
  "/user/:userId",
  access({ roles: ["admin"], dataOwner: req => req.params.userId }),
  async (req, res) => {
    const { userId } = req.params;

    const query = await db.query(
      `
        SELECT *
        FROM maintenances
        WHERE userid = $1;
      `,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: "Fetched maintenances",
      maintenances: query.rows
    });
  }
);

router.get("/", access({ roles: ["admin"] }), async (req, res) => {
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
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const query = await db.query(
    `
      SELECT *
      FROM maintenances
      WHERE id = $1;
    `,
    [id]
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

router.post("/", access({ roles: ["admin"] }), async (req, res) => {});

router.put("/:id", access({ roles: ["admin"] }), async (req, res) => {});

router.delete("/:id", access({ roles: ["admin"] }), async (req, res) => {});

module.exports = router;
