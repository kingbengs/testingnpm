import React from 'react';
import { Route } from "react-router-dom";

import { authContext } from './AuthProvider';
import ExternalRedirect from './ExternalRedirect';

import { getLoginUrl } from 'react-project/Util/ExternalUrlHelper';

const LOGIN_URL = getLoginUrl();

export const AuthRoute = ({ render, ...rest}) => {
  return (
    <Route
      {...rest}
      render={props =>
        <authContext.Consumer>
          {({auth: { isAuthenticated }}) => (
            isAuthenticated ? (
              render(props)
            ) : (
              <ExternalRedirect
                to={`${LOGIN_URL}?redirectTo=${window.location.href}`}
              />
            )
          )}
        </authContext.Consumer>
      }
    />
  );
};
