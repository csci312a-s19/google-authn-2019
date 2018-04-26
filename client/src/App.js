/* eslint-disable no-console, react/no-multi-comp, react/prefer-stateless-function */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
} from 'react-router-dom';
import { GoogleLogin, GoogleLogout } from 'react-google-login';

const AUTHN_PROFILE_KEY = 'profile';

// Helper class for storing user profile in the sessionStorage
class Authn {
  static isAuthn() {
    return !!window.sessionStorage.getItem(AUTHN_PROFILE_KEY);
  }

  static logout() {
    window.sessionStorage.removeItem(AUTHN_PROFILE_KEY);
  }

  static saveProfile(profile) {
    // Session storage must be a string
    window.sessionStorage.setItem(AUTHN_PROFILE_KEY, JSON.stringify(profile));
  }

  static getProfile() {
    return JSON.parse(window.sessionStorage.getItem('profile'));
  }
}


const PrivateRoute = ({ component: Comp, ...rest }) => (
  <Route
    {...rest}
    render={renderProps =>
      (Authn.isAuthn() ?
        (<Comp {...renderProps} />) :
        (<Redirect to={{ pathname: '/login', state: { from: renderProps.location } }} />)
      )
    }
  />
);

PrivateRoute.propTypes = {
  component: PropTypes.func.isRequired,
};

class Login extends React.Component {
  constructor() {
    super();

    this.state = {
      successfulLogin: false,
    };

    this.handleGoogleLogin = this.handleGoogleLogin.bind(this);
    this.handleGoogleFailure = this.handleGoogleFailure.bind(this);
  }

  handleGoogleLogin(response) {
    // The response value is a GoogleUser object
    // https://github.com/anthonyjgrove/react-google-login#onsuccess-callback--w-offline-false

    // Here we construct a profile object of desired information
    // to eventually be saved to the local session
    const profile = {
      googleId: response.googleId,
      name: response.profileObj.name,
      tokenId: response.tokenId, // We will use this token to login to the server
    };

    // If we want to use the Google authentication on the server, send the token
    // to the server in the authorization header. The server will validate the token
    // and extract the profile information
    fetch('/login', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${profile.tokenId}`,
      },
    }).then(() => {
      Authn.saveProfile(profile);
      this.setState({ successfulLogin: true });
    });
  }

  handleGoogleFailure(response) { // eslint-disable-line class-methods-use-this
    console.log(response);
  }

  render() {
    const { from } = this.props.location.state || { from: { pathname: '/' } };

    if (this.state.successfulLogin) {
      // If successfully logged in, redirect to route that triggered login
      return <Redirect to={from} />;
    }

    // You could add hostedDomain="middlebury.edu" to require a Middlebury account
    // Per Google documentation, make sure to validate that domain in response
    return (
      <div>
        <p>You must log in to view the page at {from.pathname}</p>
        <GoogleLogin
          clientId="917756572861-n4m7sgc9narqgmgavu8uhglu11anb2gu.apps.googleusercontent.com"
          buttonText="Login with Google"
          isSignedIn
          onSuccess={this.handleGoogleLogin}
          onFailure={this.handleGoogleFailure}
        />
      </div>
    );
  }
}

// Only validate the fields we actually use
Login.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.object,
  }).isRequired,
};

const ProtectedExample = ({ history }) => {
  const profile = Authn.getProfile();
  // You would likely want to incorporate the logout into a navigation
  // bar or other header (instead of having a random button)
  return (
    <div>
      <h3>Welcome {profile.name}!</h3>
      <div
        role="presentation"
        onClick={() => {
          // Use event bubbling logout on a click, even when GoogleLogout
          // isn't successful. The latter is common on reload because the
          // internal Google authorization object is no longer available.
          Authn.logout();
          history.push('/');
        }}
      >
        <GoogleLogout
          buttonText="Logout"
          onLogoutSuccess={() => {}}
        />
      </div>
    </div>
  );
};

ProtectedExample.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <h1>CS312 Google Authentication Example</h1>
          <Route path="/login" component={Login} />
          <PrivateRoute exact path="/" component={ProtectedExample} />
        </div>
      </Router>
    );
  }
}

export default App;
