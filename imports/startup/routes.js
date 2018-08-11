import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';

// route components
import AppContainer from '../ui/AppContainer.js';
import VotingView from '../ui/VotingView.js';
import CreateVoting from '../ui/CreateVoting.js';


const browserHistory = createBrowserHistory();

export const renderRoutes = () => (
  <Router history={browserHistory}>
    <Switch>
      <Route name="main" exact path="/" component={AppContainer}/>
      <Route name="voting" exact path="/vote/:id" component={VotingView} />
      <Route name="new" exact path="/new" component={CreateVoting} />
    </Switch>
  </Router>
);