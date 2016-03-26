import "babel-polyfill"
import React from 'react'
import { render } from 'react-dom'
import { Router, browserHistory } from 'react-router'
import routes from '../modules/routes'
import io from "socket.io-client"

const socket = io('//localhost:8000')

render(
  <Router history={browserHistory} routes={routes}/>,
  document.getElementById('app')
)
