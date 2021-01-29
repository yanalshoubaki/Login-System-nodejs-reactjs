const express = require("express");
const mysql = require("mysql");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookie = require("cookie-parser");
const jwt = require("jsonwebtoken");

// Initilize middleware
const app = express();
const saltRounds = 10;
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookie());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    key: "userId",
    secret: "subscribe",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
    },
  })
);

// Connecting to database
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "cruddatabase",
});

// App routes

const verifyJWT = (req, res) => {
  const token = req.header["x-access-token"];
  console.log(req);
  if (!token) {
    res.send("Yo, we need a token, please give it to us next time!");
  } else {
    jwt.verify(token, "jwtSecret", (err, decoded) => {
      if (err) {
        res.send({
          auth: false,
          message: "U failed to authenticate",
          requ: req.header,
        });
      } else {
        req.userId = decoded.id;
        next();
      }
    });
  }
};

app.get("/isUserAuth", verifyJWT, (req, res) => {
  res.send("You are authenticated congrates");
});

app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
    }

    db.query(
      "INSERT INTO users (username, password) VALUES (?,?);",
      [username, hash],
      (err, result) => {
        console.log(err);
      }
    );
  });
});

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  db.query(
    "SELECT * FROM users WHERE username= ?;",
    [username],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (error, response) => {
          if (response) {
            const id = result[0].id;
            const token = jwt.sign({ id }, "jwtSecret", { expiresIn: 300 });
            req.session.user = result;
            res.send({ auth: true, token: token, result: result });
          } else {
            res.send({
              auth: false,
              message: "Wrong username/password combination!",
            });
          }
        });
      } else {
        res.send({ auth: false, message: "User Doesn't exist" });
      }
    }
  );
});

app.listen(3001, () => {
  console.log("app listen port 3001");
});
