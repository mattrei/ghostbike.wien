/*eslint no-console:0*/
import "babel-polyfill"
import React from 'react'
import { createServer } from 'react-project/server'
import createIo from 'socket.io'
import { RouterContext } from 'react-router'
import Document from '../modules/components/Document'
import routes from '../modules/routes'

import mongoose from 'mongoose'
import graffiti from '@risingstack/graffiti'
import schema from './schema'

const PORT =  process.env.OPENSHIFT_INTERNAL_PORT || process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT
const IP = process.env.OPENSHIFT_NODEJS_IP  || 'localhost'

function getApp(req, res, requestCallback) {
  // here is your chance to do things like get an auth token and generate
  // your route config w/ request aware `onEnter` hooks, etc.
  requestCallback(null, {
    routes: routes,
    render(routerProps, renderCallback) {
      // here is your chance to load up data before rendering and pass it to
      // your top-level components
      renderCallback(null, {
        renderDocument: (props) => <Document {...props}/>,
        renderApp: (props) => <RouterContext {...props}/>
      })
    }
  })
}

const server = createServer(getApp)
server.use(graffiti.express({schema}))

const httpServer = require('http').Server(server)
const io = createIo(httpServer)
//
server._listen = (port) => {}
server.start()
httpServer.listen(PORT, IP)


//const server = require('http').Server(app)
//server.listen(SOCKETIO_PORT) // socketio port
//const io = require('socket.io')(server);
const events = require('./events')(io);
