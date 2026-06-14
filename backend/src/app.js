const express = require("express");
const authRouter = require("./modules/auth/auth.routes");
const turfRoutes = require("./modules/turf/turf.routes");
const slotRoutes = require("./modules/slot/slot.routes");
const bookingRoutes = require("./modules/bookings/booking.routes");
const uploadRoutes = require("./modules/upload/upload.routes");
const statsRoutes = require("./modules/stats/stats.routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/turfs", turfRoutes);
app.use("/api/v1/slots", slotRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/stats", statsRoutes);
module.exports = app;
