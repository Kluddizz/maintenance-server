const express = require("express");
const access = require("../express-access");
const router = express.Router();

const db = require("../db");

router.get(
  "/statistics/state/:stateId",
  access({ roles: ["admin"] }),
  async (req, res) => {
    const { stateId } = req.params;

    const stateQuery = await db.query(
      `
      SELECT COUNT(id)
      FROM maintenances
      WHERE stateid = $1;
      `,
      [stateId]
    );

    const totalQuery = await db.query(
      `
      SELECT COUNT(id)
      FROM maintenances;
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
  "/user/:userId",
  access({ roles: ["admin"], dataOwner: (req) => req.params.userId }),
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
      maintenances: query.rows,
    });
  }
);

router.get("/", access({ roles: ["admin"] }), async (req, res) => {
  const query = await db.query(
    `
      SELECT maintenances.*,
             customers.name as customer_name,
             states.name as state_name,
             states.color as state_color,
             due_date(maintenances.start_date, maintenances.frequency) as due_date
      FROM maintenances
      LEFT JOIN states
        ON maintenances.stateid = states.id
      LEFT JOIN systems
        ON maintenances.systemid = systems.id
      LEFT JOIN customers
        ON systems.customerid = customers.id;
    `,
    []
  );

  res.status(200).json({
    success: true,
    message: "Fetched all maintenances",
    maintenances: query.rows,
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
      maintenance: query.rows[0],
    });
  } else {
    res.status(400).json({
      success: false,
      message:
        "There is no maintenance entry for the requesting user with the given ID",
    });
  }
});

router.post("/", access({ roles: ["admin"] }), async (req, res) => {
  const { name, frequency, systemid, userid, stateid, start_date } = req.body;

  try {
    const query = await db.query(
      `
      INSERT INTO maintenances (name, frequency, systemid, userid, stateid, start_date)
      VALUES ($1, $2, $3, $4, $5, $6);
    `,
      [name, frequency, systemid, userid, stateid, start_date]
    );

    res.status(200).json({
      success: true,
      message: "Created new maintenance",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Could not create new maintenance",
    });
  }
});

router.put("/:id", access({ roles: ["admin"] }), async (req, res) => {
  const { id } = req.params;
  const { name, frequency, systemid, userid, stateid, start_date } = req.body;

  try {
    const query = await db.query(
      `
        UPDATE maintenances
        SET name = $1, frequency = $2, systemid = $3, userid = $4, stateid = $5, start_date = $6
        WHERE id = $7;
      `,
      [name, frequency, systemid, userid, stateid, start_date, id]
    );

    res.status(200).json({
      success: true,
      message: "Updated maintenance",
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      success: false,
      message: "Could not update maintenance",
    });
  }
});

router.delete("/:id", access({ roles: ["admin"] }), async (req, res) => {
  const { id } = req.params;

  try {
    const query = await db.query(
      `
        DELETE
        FROM maintenances
        WHERE id = $1;
      `,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Deleted maintenance",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Could not delete maintenance",
    });
  }
});

module.exports = router;
