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
      FROM appointments
      WHERE stateid = $1
            AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW());
      `,
      [stateId]
    );

    const totalQuery = await db.query(
      `
      SELECT COUNT(id)
      FROM maintenances
      WHERE EXTRACT(YEAR FROM due_date(start_date, frequency)) = EXTRACT(YEAR FROM NOW());
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

router.get("/:year?", access({ roles: ["admin"] }), async (req, res) => {
  const { year } = req.params;

  let maintenances;

  if (year) {
    // There is a year provided, so return the entries of this year only.
    const query = await db.query(
      `
      SELECT maintenances.*,
             customers.name as customer_name,
             due_date(maintenances.start_date, maintenances.frequency) as due_date,
             CASE WHEN states.name IS NULL THEN 'Ausstehend' ELSE states.name END AS state_name,
             CASE WHEN states.color IS NULL THEN '#c4c4c4' ELSE states.color END AS state_color
      FROM maintenances
      LEFT JOIN systems
        ON maintenances.systemid = systems.id
      LEFT JOIN customers
        ON systems.customerid = customers.id
      LEFT JOIN appointments
        ON appointments.maintenanceid = maintenances.id
           AND appointments.date = due_date(maintenances.start_date, maintenances.frequency)
      LEFT JOIN states
        ON states.id = appointments.stateid
      WHERE EXTRACT(YEAR FROM (due_date(maintenances.start_date, maintenances.frequency))) = $1
      ORDER BY due_date;
      `,
      [year]
    );

    maintenances = query.rows;
  } else {
    // There is no year provided, so return all entries.
    const query = await db.query(
      `
      SELECT maintenances.*,
             customers.name as customer_name,
             due_date(maintenances.start_date, maintenances.frequency) as due_date,
             CASE WHEN states.name IS NULL THEN 'Ausstehend' ELSE states.name END AS state_name,
             CASE WHEN states.color IS NULL THEN '#c4c4c4' ELSE states.color END AS state_color
      FROM maintenances
      LEFT JOIN systems
        ON maintenances.systemid = systems.id
      LEFT JOIN customers
        ON systems.customerid = customers.id
      LEFT JOIN appointments
        ON appointments.maintenanceid = maintenances.id
           AND appointments.date = due_date(maintenances.start_date, maintenances.frequency)
      LEFT JOIN states
        ON states.id = appointments.stateid
      ORDER BY due_date;
      `,
      []
    );

    maintenances = query.rows;
  }

  res.status(200).json({
    success: true,
    message: "Fetched all maintenances",
    maintenances: maintenances,
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
  const { name, frequency, systemid, userid, start_date } = req.body;

  try {
    const query = await db.query(
      `
      INSERT INTO maintenances (name, frequency, systemid, userid, start_date)
      VALUES ($1, $2, $3, $4, $5, $6);
    `,
      [name, frequency, systemid, userid, start_date]
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
  const { name, frequency, systemid, userid, start_date } = req.body;

  try {
    const query = await db.query(
      `
        UPDATE maintenances
        SET name = $1, frequency = $2, systemid = $3, userid = $4, start_date = $6
        WHERE id = $7;
      `,
      [name, frequency, systemid, userid, start_date, id]
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
