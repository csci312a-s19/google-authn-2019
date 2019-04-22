/* eslint-disable no-console */
const express = require('express');
const passport = require('passport');
const CustomStrategy = require('passport-custom').Strategy;
const { OAuth2Client } = require('google-auth-library');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const logins = new Map();

// express only serves static assets in production
if (process.env.NODE_ENV === 'production') {
  // Resolve client build directory as absolute path to avoid errors in express
  const path = require('path'); // eslint-disable-line global-require
  const buildPath = path.resolve(__dirname, '../client/build');

  app.use(express.static(buildPath));

  // Serve the HTML file included in the CRA client
  app.get('/', (request, response) => {
    response.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Access the GOOGLE_CLIENT_ID from the environment instead of hardcoding
// it into the application
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Implement a simple passport custom strategy using the Google tokens as a
// session
passport.use('google-id-token', new CustomStrategy((request, done) => {
  let token;
  if (request.headers.authorization && request.headers.authorization.startsWith('Bearer ')) {
    token = request.headers.authorization.slice(7);
  } else {
    done(null, false);
    return;
  }

  googleClient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  }).then((ticket) => {
    const payload = ticket.getPayload();
    // At this point you could create a user account from the payload if the user
    // doesn't have one and create a session for the user (or continue to use
    // the Google token as a session)
    done(null, payload);
  }).catch(() => done(null, false));
}));

app.use(passport.initialize());


app.post(
  '/login',
  passport.authenticate('google-id-token', { session: false }),
  (request, response) => {
    let user = logins.get(request.user.email);
    if (user === undefined) {
      user = {
        name: request.user.name,
        email: request.user.email,
        logins: 0,
      };
      logins.set(user.email, user);
    }
    user.logins += 1;
    console.log(user);
    response.send({ count: user.logins });
  },
);

module.exports = {
  app,
};
