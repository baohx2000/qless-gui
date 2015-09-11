let rrr = require('redux-react-router');
let routerStateReducer = rrr.routerStateReducer;
let reduxRouteComponent = rrr.reduxRouteComponent;
let transitionTo = rrr.transitionTo;

let LOCATION_DID_CHANGE = require('redux-react-router/actionTypes').LOCATION_DID_CHANGE;
let history = require('react-router/lib/BrowserHistory').history;
let createStore = require('redux').createStore;
let Connector = require('react-redux').Connector;

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link } from 'react-router';
import pure from 'react-pure-component';

import { Provider } from 'react-redux';
import App from './containers/App';
import configureStore from './redux/configureStore';

const store = configureStore();

React.render(
  <Provider store={store}>
    {() => <App />}
  </Provider>,
  document.getElementById('root')
);
