const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const connect = require("./schemas");

connect();

const corsOptions = {
  origin: true,
  credentials: true,
}; //동일 기원이 아닐 경우

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "woongs",
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/member", require("./routers/membersRouter"));

app.listen(8080, () => {
  console.log("server listening...");
});
