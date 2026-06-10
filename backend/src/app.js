const express = require("express");
const authRouter = require("./modules/auth/auth.routes");
const turfRoutes = require("./modules/turf/turf.routes");
const slotRoutes = require("./modules/slot/slot.routes");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/turfs", turfRoutes);
app.use("/api/v1/slots", slotRoutes);

module.exports = app;
