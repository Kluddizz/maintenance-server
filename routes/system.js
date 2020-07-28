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

router.get("/", async (req, res) => {});

router.get("/:id", async (req, res) => {});

router.post("/", async (req, res) => {});

router.put("/:id", async (req, res) => {});

router.delete("/:id", async (req, res) => {});

module.exports = router;
