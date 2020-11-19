const express = require("express");
const access = require("../express-access");
const router = express.Router();

const db = require("../db");

router.get("/", access({ roles: ["admin"] }), async (req, res) => {
  const query = await db.query(
    `
      SELECT *
      FROM systems;
    `,
    []
  );

  res.status(200).json({
    success: true,
    message: "Fetched all systems",
    systems: query.rows,
  });
});

router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  const query = await db.query(
    `
    SELECT systems.*
    FROM users
    JOIN appointments
      ON appointments.userid = users.id
    JOIN maintenances
      ON maintenances.id = appointments.maintenanceid
    JOIN systems
      ON systems.id = maintenances.systemid
    WHERE users.id = $1;
    `,
    [userId]
  );

  res.status(200).json({
    success: true,
    systems: query.rows,
  });
});

router.get("/customer/:id", access({ roles: ["admin"] }), async (req, res) => {
  const { id } = req.params;

  try {
    const query = await db.query(
      `
      SELECT *
      FROM systems
      WHERE customerid = $1;
    `,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Fetched all systems",
      systems: query.rows,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Could not request systems of the given customer",
    });
  }
});

router.get("/:id", access({ roles: ["admin"] }), async (req, res) => {
  const { id } = req.params;

  const query = await db.query(
    `
      SELECT *
      FROM systems
      WHERE id = $1;
    `,
    [id]
  );

  if (query.rows.length === 1) {
    res.status(200).json({
      success: true,
      message: "Fetched system",
      system: query.rows[0],
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Could not request system with the given ID",
    });
  }
});

router.post("/", access({ roles: ["admin"] }), async (req, res) => {
  const { name, street, city, zip, customerid } = req.body;

  try {
    const query = await db.query(
      `
      INSERT
      INTO systems (name, street, city, zip, customerid)
      VALUES($1, $2, $3, $4, $5);
    `,
      [name, street, city, zip, customerid]
    );

    res.status(200).json({
      success: true,
      message: "Created new system",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Cannot create new system",
    });
  }
});

router.put("/:id", access({ roles: ["admin"] }), async (req, res) => {
  const { id } = req.params;
  const { name, street, city, zip, customerid } = req.body;

  try {
    const query = await db.query(
      `
      UPDATE systems
      SET name = $1, street = $2, city = $3, zip = $4, customerid = $5
      WHERE id = $6;
    `,
      [name, street, city, zip, customerid, id]
    );

    res.status(200).json({
      success: true,
      message: "Updated system",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Could not update system",
    });
  }
});

router.delete("/:id", access({ roles: ["admin"] }), async (req, res) => {
  const { id } = req.params;

  try {
    const query = await db.query(
      `
      DELETE
      FROM systems
      WHERE id = $1;
    `,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Deleted system",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Could not delete system",
    });
  }
});

module.exports = router;
