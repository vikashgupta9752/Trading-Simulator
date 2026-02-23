const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5001/api/users/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        // Check if user exists by email (to merge accounts)
        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
        }

        // Create new user
        user = new User({
            username: profile.displayName || profile.emails[0].value.split('@')[0],
            email: profile.emails[0].value,
            googleId: profile.id,
            balance: 100000 // Starting balance for new users
        });

        // Handle username collision
        try {
            await user.save();
        } catch (e) {
            if (e.code === 11000) {
                user.username = `${user.username}${Math.floor(Math.random() * 1000)}`;
                await user.save();
            } else {
                throw e;
            }
        }
        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:5001/api/users/auth/github/callback",
    scope: ['user:email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ githubId: profile.id });
        if (user) return done(null, user);

        // GitHub email might be private, handle carefully
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        if (email) {
            user = await User.findOne({ email: email });
            if (user) {
                user.githubId = profile.id;
                await user.save();
                return done(null, user);
            }
        }

        user = new User({
            username: profile.username,
            email: email, // Optional/Sparse
            githubId: profile.id,
            balance: 100000
        });

        try {
            await user.save();
        } catch (e) {
            console.error("Error creating github user:", e);
            if (e.code === 11000) { // Duplicate key
                // Could be username or email (if email isn't null and collided)
                // If it's username, append number
                user.username = `${user.username}${Math.floor(Math.random() * 1000)}`;
                await user.save();
            } else {
                throw e;
            }
        }
        done(null, user);

    } catch (err) {
        done(err, null);
    }
}));

module.exports = passport;
