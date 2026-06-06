const express = require("express");
const authRouter = require("./modules/auth/auth.routes");

const app = express();

app.use(express.json());
app.use("/api/v1/auth", authRouter);

module.exports = app;
