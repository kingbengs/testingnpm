import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from "react-router-dom";
import { NotFound } from './Main/NotFound';

import AuthProvider from 'react-project/routing/AuthProvider';
import { AuthRoute } from 'react-project/routing/AuthRoute';

import {Funnel} from 'react-project/Pages/Funnel';
import "@reach/tooltip/styles.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <AuthRoute path="/funnels/:funnelId" exact render={props => <Funnel {...props} />} />
          <Route path="*">
            <NotFound/>
          </Route>
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;
