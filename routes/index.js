const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const userRoutes = require("./users");
const articleRoutes = require("./articles");
const tagRoutes = require("./tags");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/articles", articleRoutes);
router.use("/tags", tagRoutes);

module.exports = router;
