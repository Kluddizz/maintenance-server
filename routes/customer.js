const express = require("express");
const access = require("../express-access");
const router = express.Router();

const db = require("../db");

router.use("/", access({ roles: ["admin"] }));

router.get("/", async (req, res) => {
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
    customers: query.rows
  });
});

router.get("/:id", async (req, res) => {
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
      customer: query.rows[0]
    });
  } else {
    res.status(400).json({
      success: false,
      message: "This customer does not exist"
    });
  }
});

router.post("/", async (req, res) => {
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
      message: "Created new customer"
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Could not create the new customer"
    });
  }
});

router.put("/:id", async (req, res) => {
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
      message: "Updated existing customer"
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Could not update customer"
    });
  }
});

router.delete("/:id", async (req, res) => {
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
      message: "Deleted customer"
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Could not delete customer"
    });
  }
});

module.exports = router;
