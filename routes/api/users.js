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
const generateJwtToken = require("../../utils/jwt");


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
router.post("/register", async (req, res) => {
  const { errors, isvalid } = validateregisterinput(req.body);
  // console.log(errors);

  //check validatioin 
  if (!isvalid) {
    return res.status(400).json(errors);
  }

  try {
    const user = await User.findOne({ email: req.body.email });
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

      const salt = await bcrypt.genSalt(10);
      newuser.password = await bcrypt.hash(req.body.password, salt);

      const savedUser = await newuser.save();
      const token = generateJwtToken(savedUser);

      return res.json({
        success: true,
        token: "Bearer " + token,
        user: {
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
        }
      });
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json(err);
    }
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


router.get("/login", (req, res) => {
  return res.status(500).json({ message: 'Internal Server Error' });
})

//@routes GET api/users/login
//@desc user login
//@access public

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //check if email is null of not
  const { errors, isvalid } = validateLogininput(req.body);
  console.log(errors);
  //check validatioin 
  if (!isvalid) {
    return res.status(400).json(errors);
  }

  try {
    const user = await User.findOne({ email });

    // if email not found then return 404 status
    if (!user) {
      errors.email = "User Not found "
      return res.status(404).json(errors)
    };

    //compare the password to hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      //User Mathched
      const payload = { id: user.id, name: user.name, avatar: user.avatar };
      //  Sign token Without Function 
      jwt.sign(payload, key.secretkey, { expiresIn: '7d' }, (err, token) => {
        return res.json({ token: "Bearer " + token });
      });
      //  Sign token With Function 
      // const token = generateJwtToken(req.user);
      // return res.json({ token: "Bearer " + token, user: req.user });
    } else {
      errors.password = "Password is Incorrect"
      return res.status(400).json(errors);
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json(err);
    }
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

//@routes GET api/users/google
//@desc Register Using  Google Auth
//@access Public
router.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);


router.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    return res.send('/dashboard');
  }
);

//@routes GET api/users/github
//@desc Register Using github Auth
//@access Public
router.get('/auth/github',
  passport.authenticate('github', {
    scope: ['user:email'],
    prompt: 'select_account' // GitHub doesn't officially support 'prompt', but including it won't cause issues
  })
);


router.get('/auth/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = generateJwtToken(req.user);
    res.json({ token: "Bearer " + token, user: req.user });
  }
);

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
