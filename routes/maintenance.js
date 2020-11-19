const express = require("express");
const access = require("../express-access");
const router = express.Router();

const db = require("../db");

router.get(
  "/user/:userId",
  access({ roles: ["admin"], dataOwner: (req) => req.params.userId }),
  async (req, res) => {
    const { userId } = req.params;

    const query = await db.query(
      `
        SELECT maintenances.*
        FROM users
        JOIN appointments
          ON appointments.userid = users.id
        JOIN maintenances
          ON maintenances.id = appointments.maintenanceid
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
            appointments.userid,
            customers.name as customer_name,
            systems.name as system_name,
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
          AND appointments.date::date = due_date(maintenances.start_date, maintenances.frequency)::date
    LEFT JOIN states
      ON states.id = appointments.stateid
    ORDER BY due_date;
    `,
    []
  );

  res.status(200).json({
    success: true,
    message: "Fetched all maintenances",
    maintenances: query.rows,
  });
});

router.get(
  "/user/:userid/year/:year",
  access({ roles: ["admin"], dataOwner: (req) => req.params.userid }),
  async (req, res) => {
    const { userid, year } = req.params;

    const query = await db.query(
      `
    SELECT maintenances.*,
            appointments.userid,
            customers.name as customer_name,
            systems.name as system_name,
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
          AND appointments.date::date = due_date(maintenances.start_date, maintenances.frequency)::date
    LEFT JOIN states
      ON states.id = appointments.stateid
    WHERE EXTRACT(YEAR FROM (due_date(maintenances.start_date, maintenances.frequency))) = $1
          AND appointments.userid = $2
    ORDER BY due_date;
    `,
      [year, userid]
    );

    res.status(200).json({
      success: true,
      message: "Fetched all maintenances",
      maintenances: query.rows,
    });
  }
);

router.get("/year/:year", access({ roles: ["admin"] }), async (req, res) => {
  const { year } = req.params;

  const query = await db.query(
    `
    SELECT maintenances.*,
            appointments.userid,
            customers.name as customer_name,
            systems.name as system_name,
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
          AND appointments.date::date = due_date(maintenances.start_date, maintenances.frequency)::date
    LEFT JOIN states
      ON states.id = appointments.stateid
    WHERE EXTRACT(YEAR FROM (due_date(maintenances.start_date, maintenances.frequency))) = $1
    ORDER BY due_date;
    `,
    [year]
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
  const { name, frequency, systemid, userid, start_date } = req.body;

  try {
    const query = await db.query(
      `
      INSERT INTO maintenances (name, frequency, systemid, userid, start_date)
      VALUES ($1, $2, $3, $4, $5);
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
        SET name = $1, frequency = $2, systemid = $3, start_date = $4
        WHERE id = $5;
      `,
      [name, frequency, systemid, start_date, id]
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
