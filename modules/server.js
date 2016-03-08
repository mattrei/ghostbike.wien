/*eslint no-console:0*/
import "babel-polyfill"
import React from 'react'
import { createServer } from 'react-project/server'
import { RouterContext } from 'react-router'
import Document from '../modules/components/Document'
import routes from '../modules/routes'
import Socket from 'socket.io'

function renderDocument(props, cb) {
  cb(null, <Document {...props}/>)
}

function renderApp(props, cb) {
  cb(null, <RouterContext {...props}/>)
}

function getApp(req, res, cb) {
  cb(null, { renderDocument, routes, renderApp })
}

const app = createServer(getApp)
const server = require('http').Server(app)
const io = new Socket(server)
const events = require('./events')(io);

app.start()
