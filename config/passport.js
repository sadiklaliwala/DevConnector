const mongoose = require("mongoose");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const keys = require("../config/keys");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = mongoose.model("User");

const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: keys.secretkey,
};

if (typeof keys.secretkey !== "string") {
  throw new Error("Secret key must be a string");
}

module.exports = (passport) => {
  // JWT Strategy - verify JWT tokens for protected routes
  passport.use(
    new JwtStrategy(jwtOpts, async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.id);
        return done(null, user || false);
      } catch (err) {
        return done(err, false);
      }
    })
  );

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL + '/api/users/auth/google/callback',
        // callbackURL: 'http://localhost:5000/api/users/auth/google/callback',
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            // Check if user exists with the same email (local user)
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
              // Link Google account to existing user
              user.googleId = profile.id;
            } else {
              // Create new user
              user = new User({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value,
              });
            }
            await user.save();
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  // GitHub OAuth Strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        // callbackURL: process.env.CALLBACK_URL+'/auth/github/callback',
        callbackURL: 'http://localhost:5000/api/users/auth/github/callback',
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ githubId: profile.id });

          if (!user) {
            const email =
              profile.emails && profile.emails[0] && profile.emails[0].value;
            user = (email && (await User.findOne({ email }))) || null;

            if (user) {
              user.githubId = profile.id;
            } else {
              user = new User({
                githubId: profile.id,
                name: profile.displayName || profile.username,
                email,
                avatar: profile.photos[0].value,
              });
            }

            await user.save();
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
};
