import '../modules/styles.css'
import React from 'react'
import { Route, IndexRoute, Redirect } from 'react-router'
import { ServerRoute, lazy } from 'react-project'

import App from './components/App'
import Home from './components/Home'
import NoMatch from './components/NoMatch'
//import loadDragon from 'bundle?lazy!./components/Dragon'

import Map from './components/Map'

import hello from './api/hello'

export default (
  <Route>
    <Route path="/" component={App}>
      <IndexRoute component={Map}/>
      {/*<Route path="dragon" getComponent={lazy(loadDragon)}/>*/}
    </Route>
    <ServerRoute path="/api">
      <ServerRoute path=":hello" get={hello}/>
    </ServerRoute>
    <Redirect from="/not-dragon" to="/dragon"/>
    <Route path="*" status={404} component={NoMatch}/>

  </Route>
)
