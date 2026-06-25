const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRouter = require("./modules/auth/auth.routes");
const turfRoutes = require("./modules/turf/turf.routes");
const slotRoutes = require("./modules/slot/slot.routes");
const bookingRoutes = require("./modules/bookings/booking.routes");
const paymentRoutes = require("./modules/payments/payment.routes");
const uploadRoutes = require("./modules/upload/upload.routes");
const statsRoutes = require("./modules/stats/stats.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const depositRoutes = require("./modules/deposit/deposit.routes");
const reportRoutes = require("./modules/reports/report.routes");
const notificationRoutes = require("./modules/notifications/notification.routes");

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/stats", statsRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/deposit", depositRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/notifications", notificationRoutes);

module.exports = app;
