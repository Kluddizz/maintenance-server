const express = require("express");
const router = express.Router();

const db = require("../db");

router.use("/", (req, res, next) => {
  if (req.user.roleid !== 0) {
    res.status(400).json({
      success: false,
      message: "You are not allowed to do this"
    });
  } else {
    next();
  }
});

router.get("/", async (req, res) => {
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
    systems: query.rows
  });
});

router.get("/customer/:id", async (req, res) => {
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
      systems: query.rows
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Could not request systems of the given customer"
    });
  }
});

router.get("/:id", async (req, res) => {
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
      system: query.rows[0]
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Could not request system with the given ID"
    });
  }
});

router.post("/", async (req, res) => {});

router.put("/:id", async (req, res) => {});

router.delete("/:id", async (req, res) => {});

module.exports = router;
