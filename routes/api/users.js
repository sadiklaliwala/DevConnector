const express = require("express");
const User = require("../../models/usermodel");
const router = express.Router();
const bcrypt = require("bcryptjs");
const gravtar = require("gravatar");
const key = require("../../config/keys");
const jwt = require("jsonwebtoken");
const passport = require('passport');
const validateregisterinput = require('../../validator/registrationvalidator');
const validateLogininput = require('../../validator/loginvalidator');


//note:always write return before res.json() or res.send();

//@routes GET api/users/test
//@desc test user  routes
//@access public
router.get("/test", (req, res) => {
  res.json({ msg: "user testing " });
});

//@routes GET api/users/register
//@desc user register
//@access public

router.post("/register", (req, res) => {
  const { errors, isvalid } = validateregisterinput(req.body);
  // console.log(errors);

  //check validatioin 
  if (!isvalid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        errors.email = " Email Already Exist ";
        return res.status(400).json(errors);
      } else {
        const avtar = gravtar.url(req.body.email, {
          s: "200", //size of image
          r: "pg", //rating of image
          d: "mm", //  defualt status
        });
        const newuser = new User({
          name: req.body.name,
          email: req.body.email,
          avtar,
          password: req.body.password,
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(req.body.password, salt, (err, hash) => {
            if (err) throw err;
            newuser.password = hash;
            newuser
              .save()
              .then((user) => { return res.json(user) })
              .catch(err => {
                if (err.name === 'ValidationError') {
                  return res.status(400).json(err);
                }
                console.log(err);
                return res.status(500).json({ message: 'Internal Server Error' });
              });
            //             .catch((err) => console.log(err));
          });
        });
      }
    }).catch(err => {
      console.log(err);
      return res.status(500).json({ message: 'Internal Server Error' });
    });
});

//@routes GET api/users/login
//@desc user login
//@access public

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //check if email is null of not
  const { errors, isvalid } = validateLogininput(req.body);
  console.log(errors);
  //check validatioin 
  if (!isvalid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email })
    .then((user) => {
      // if email not found then return 404 status
      if (!user) {
        errors.email = "User Not found "
        return res.status(404).json(errors)
      };
      //compare the password to hash
      bcrypt.compare(password, user.password)
        .then((isMatch) => {
          if (isMatch) {
            //User Mathched
            const payload = { id: user.id, name: user.name, avtar: user.avtar };
            //  Sign token
            jwt.sign(payload, key.secretkey, { expiresIn: 3600 }, (err, token) => {
              return res.json({ token: "Bearer " + token });
            });
          }
          else {
            errors.password = "Password is Incorrect"
            return res.status(400).json(errors);
          }
        }).catch(err => {
          if (err.name === 'ValidationError') {
            return res.status(400).json(err);
          }
          console.log(err);
          return res.status(500).json({ message: 'Internal Server Error' });
        });
    }).catch(err => {
      console.log(err);      return res.status(500).json({ message: 'Internal Server Error' });
    });
});

//@routes GET api/users/current
//@desc fetch user login 
//@access private

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email
  })
});

module.exports = router;


