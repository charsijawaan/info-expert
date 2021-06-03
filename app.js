var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");
const flash = require("connect-flash");
const msal = require("@azure/msal-node");

require("dotenv").config();

var indexRouter = require("./routes/index");
var authRouter = require("./routes/auth");
var homeRouter = require("./routes/home");
var googleAuthRouter = require("./routes/googleAuth");

var app = express();

app.locals.users = {};

// MSAL config
const msalConfig = {
  auth: {
    clientId: process.env.OAUTH_APP_ID,
    authority: process.env.OAUTH_AUTHORITY,
    clientSecret: process.env.OAUTH_APP_SECRET,
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Verbose,
    },
  },
};
app.locals.msalClient = new msal.ConfidentialClientApplication(msalConfig);

app.use(
  session({
    secret: "_21kLAGKt3an6zWZJDo2AqhB-..K2nrE__",
    resave: false,
    saveUninitialized: false,
    unset: "destroy",
  })
);

// Flash middleware
app.use(flash());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
var hbs = require("hbs");


app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/home", homeRouter)
app.use("/google_callback", googleAuthRouter);


module.exports = app;
