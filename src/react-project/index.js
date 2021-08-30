import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as Sentry from "@sentry/react";
import App from './App';
import * as serviceWorker from './serviceWorker';
import {createStore, applyMiddleware} from 'redux';
import rootReducer from "./redux/rootReducer";
import {Provider} from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

Sentry.init({
  dsn: "https://646dc84c2155481bba950b7d247a2041@o566772.ingest.sentry.io/5710887" , 
  environment: process.env.NODE_ENV
});

const sentryReduxEnhancer = Sentry.createReduxEnhancer({
  // Optionally pass options
});

const store = createStore(rootReducer, composeWithDevTools(
  applyMiddleware(thunk) , sentryReduxEnhancer)
);

const app = (
    <Provider store={store}>
        <App/>
    </Provider>
)

ReactDOM.render(
  app,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
