const express = require("express");
const access = require("../express-access");
const router = express.Router();

const db = require("../db");

router.get("/", access({ roles: ["admin"] }), async (req, res) => {
  const query = await db.query(
    `
      SELECT *
      FROM customers;
    `,
    []
  );

  res.status(200).json({
    success: true,
    message: "Fetched customers",
    customers: query.rows,
  });
});

router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  const query = await db.query(
    `
    SELECT customers.*
    FROM users
    JOIN appointments
      ON appointments.userid = users.id
    JOIN maintenances
      ON maintenances.id = appointments.maintenanceid
    JOIN systems
      ON systems.id = maintenances.systemid
    JOIN customers
      ON systems.customerid = customers.id
    WHERE users.id = $1;
    `,
    [userId]
  );

  res.status(200).json({
    success: true,
    customers: query.rows,
  });
});

router.get("/:id", access({ roles: ["admin"] }), async (req, res) => {
  const { id } = req.params;

  const query = await db.query(
    `
      SELECT *
      FROM customers
      WHERE id = $1;
    `,
    [id]
  );

  if (query.rows.length === 1) {
    res.status(200).json({
      success: true,
      message: "Fetched customer",
      customer: query.rows[0],
    });
  } else {
    res.status(400).json({
      success: false,
      message: "This customer does not exist",
    });
  }
});

router.post("/", access({ roles: ["admin"] }), async (req, res) => {
  const { name, street, city, zip, email, contactperson, phone } = req.body;

  try {
    const query = await db.query(
      `
        INSERT
        INTO customers (name, street, city, zip, email, contactperson, phone)
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `,
      [name, street, city, zip, email, contactperson, phone]
    );

    res.status(200).json({
      success: true,
      message: "Created new customer",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Could not create the new customer",
    });
  }
});

router.put("/:id", access({ roles: ["admin"] }), async (req, res) => {
  const { id } = req.params;
  const { name, street, city, zip, email, contactperson, phone } = req.body;

  try {
    const query = await db.query(
      `
        UPDATE customers
        SET name = $1, street = $2, city = $3, zip = $4, email = $5, contactperson = $6, phone = $7
        WHERE id = $8;
      `,
      [name, street, city, zip, email, contactperson, phone, id]
    );

    res.status(200).json({
      success: true,
      message: "Updated existing customer",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Could not update customer",
    });
  }
});

router.delete("/:id", access({ roles: ["admin"] }), async (req, res) => {
  const { id } = req.params;

  try {
    const query = await db.query(
      `
    DELETE
    FROM customers
    WHERE id = $1;
  `,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Deleted customer",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Could not delete customer",
    });
  }
});

module.exports = router;
