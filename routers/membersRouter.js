const express = require("express");
const router = express.Router();
const User = require("../schemas/users");
const crypto = require("crypto");

//회원가입
router.post("/signup", async (req, res) => {
  try {
    let obj = { email: req.body.email };

    let user = await User.findOne(obj);
    console.log(user);

    if (user) {
      res.json({
        message: "Email is duplicated. Please enter a new email.",
        dupYn: "1",
      });
    } else {
      crypto.randomBytes(64, (err, buf) => {
        if (err) {
          console.log(err);
        } else {
          crypto.pbkdf2(
            req.body.password,
            buf.toString("base64"),
            100000,
            64,
            "sha512",
            async (err, key) => {
              if (err) {
                console.log(err);
              } else {
                console.log(key.toString("base64"));
                buf.toString("base64");
                obj = {
                  email: req.body.email,
                  name: req.body.name,
                  password: key.toString("base64"),
                  salt: buf.toString("base64"),
                };
                user = new User(obj);
                await user.save();
                res.json({ message: "Sign Up Complete!", dupYn: "0" });
              }
            }
          );
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.json({ message: false });
  }
});

//로그인
router.post("/login", async (req, res) => {
  try {
    //로그인 시도 이메일값으로 아이디가 존재하는지 확인.
    await User.findOne({ email: req.body.email }, async (err, user) => {
      if (err) {
        console.log(err);
      } else {
        console.log(user);
        if (user) {
          //아이디가 존재할 경우 이메일과 패스워드가 일치하는 회원이 있는지 확인.
          console.log(req.body.password);
          console.log(user.salt);
          crypto.pbkdf2(
            req.body.password,
            user.salt,
            100000,
            64,
            "sha512",
            async (err, key) => {
              if (err) {
                console.log(err);
              } else {
                const obj = {
                  email: req.body.email,
                  password: key.toString("base64"),
                };

                const user2 = await User.findOne(obj);
                console.log(user2);
                if (user2) {
                  //있으면 로그인 처리
                  await User.updateOne({
                    email: req.body.email,
                  });
                  req.session.email = user.email;
                  res.json({
                    message: "Login Complete!",
                    _id: user2._id,
                    email: user2.email,
                  });
                } else {
                  res.json({ message: "The ID or password do not match." });
                }
              }
            }
          );
        }
      }
    });
  } catch (err) {
    console.log(err);
    res.json({ message: "Login Failed" });
  }
});

//로그아웃

router.get("/logout", (req, res) => {
  console.log("/logout" + req.sessionID);
  req.session.destroy(() => {
    res.json({ message: true });
  });
});

module.exports = router;
