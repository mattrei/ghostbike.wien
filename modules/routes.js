import '../modules/styles.css'
import React from 'react'
import { Route, IndexRoute, Redirect } from 'react-router'
import { ServerRoute, lazy } from 'react-project'

import App from './components/App'
import Home from './components/Home'
import NoMatch from './components/NoMatch'
import loadMap from 'bundle?lazy!./components/Map'

import accidents from './api/accidents'

export default (
  <Route>
    <Route path="/" component={App}>
      <IndexRoute component={Home}/>
      <Route path="map" getComponent={lazy(loadMap)}/>
    </Route>
    <ServerRoute path="/api">
      <ServerRoute path=":accidents" get={accidents}/>
    </ServerRoute>
    <Redirect from="/not-dragon" to="/dragon"/>
    <Route path="*" status={404} component={NoMatch}/>

  </Route>
)
