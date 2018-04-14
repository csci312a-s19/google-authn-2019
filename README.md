# Google Authorization Example

A simple example of using [Google Web Sign-in](https://developers.google.com/identity/sign-in/web/) in a React application. The client implements Google Web Sign-in and sends the token to the server to create an account or session. Note, this is just one of many potential approaches to authentication with OAuth.

To use this approach in your project you will need to create a [Google API Console](https://console.developers.google.com/project/_/apiui/apis/library) project and set up the OAuth client ID.

The client uses react-router to manage redirecting to the authentication page (adapted from this [example](https://reacttraining.com/react-router/web/example/auth-workflow)). The server uses a Passport.js [custom strategy](https://github.com/mbell8903/passport-custom) to validate the Google token sent by the client.

Note that the server uses the `dotenv` module to load configuration variables from a file (not committed to the VCS) or the environment (e.g. on Heroku).

## Installing (and Adding) Dependencies

The skeleton is structured as three separate packages and so the dependencies need to be installed independently in each of the top-level, the client and the server, i.e.:

```
npm install
npm install --prefix client
npm install --prefix server
```

The `--prefix` option treats the supplied path as the package root. In this case it is equivalent to `cd client` then `npm install` then `cd ..`.

*You will typically not need to install any dependencies in the top-level `package.json` file*. Most dependencies are needed by the client or the server and should be installed in the respective sub-packages, e.g. to install `react-boostrap` for your client application:

```
npm install --save react-boostrap --prefix client
```

## Running the Application

The combined application, client and server, can be run with `npm start` in the top-level directory. `npm start` launches the CRA development server on http://localhost:3000 and the backend server on http://localhost:3001. By setting the `proxy` field in the client `package.json`, the client development server will proxy any unrecognized requests to the server.
