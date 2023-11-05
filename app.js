const morgan = require("morgan");
const express = require("express");
const roomsRouter = require("./Routes/roomsRoutes");
const userRouter = require("./Routes/userRoutes");
const reviewsRouter = require("./Routes/reviewsRoutes");
const bookingsRouter = require("./Routes/bookingRoutes");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");

const helmet = require("helmet");
const path = require("path");
const { urlencoded } = require("express");
const expressMongoSanitize = require("express-mongo-sanitize");
const globalErrorHandler = require("./Controllers/errorController");
const hpp = require("hpp");
const cors = require("cors");
const app = express();
const AppError = require("./utils/appError");

// Cors
app.use(cors());

// To parse the body
app.use(express.json());
// To serve static files
app.use(express.static(path.join(__dirname, "public")));
// Set security HTTP headers
// app.use(helmet());
// Development Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// Limti requests from same IP
const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);
// Body Parser  reding  data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(urlencoded({ extended: true, limit: "10kb" }));
// Protection against NoSql query injection !!!!!
app.use(expressMongoSanitize());
// Protection against XSS  !!!!!
app.use(xss());
// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ["ratingsQuantity", "ratingsAverage", "price", "search"],
  })
);

// Get time for each request
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
app.use("/api/v1/rooms", roomsRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewsRouter);
app.use("/api/v1/booking", bookingsRouter);

app.all("*", (req, res, next) => {
  return next(
    new AppError("This page doest not exists on the current server", 404)
  );
});
app.use(globalErrorHandler);
module.exports = app;
