import document from 'global/document'
import window from 'global/window'

import React from 'react'
import Relay from 'react-relay'
import ReactDOM from 'react-dom'
import { header } from './styles.css'
import Title from 'react-title-component'

import shortid from 'shortid'

import PIXI from 'pixi.js'
import r from 'r-dom'
import MapGL from 'react-map-gl'

import Immutable from 'immutable'
import tinycolor from 'tinycolor2'
import Overlay from './overlay'

import Attribution from './attribution'
var rasterTileStyle = require('raster-tile-style');
const tileSource = '//tile.stamen.com/toner/{z}/{x}/{y}.png';
const mapStyle = rasterTileStyle([tileSource], 512)

import {API_KEY, decode} from './routing'

const VIE = {lat: 48.209206, lng: 16.372778}

import io from 'socket.io-client'

const SOCKETIO_PORT = process.env.SOCKETIO_PORT || 8082
const ioSocket = io(`http://localhost:${SOCKETIO_PORT}`)

class Map extends React.Component {

  state = {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        latitude: VIE.lat,
        longitude: VIE.lng,
        //mapStyle: Immutable.fromJS(mapStyle),
        mapStyle: 'mapbox://styles/mapbox/dark-v8',
        mapboxApiAccessToken: 'pk.eyJ1IjoibWF0dHJlIiwiYSI6IjRpa3ItcWcifQ.s0AGgKi0ai23K5OJvkEFnA',
        zoom: 11,
        isDragging: false
      },
      accidents: [],
      polylines: [],
      ghostbikes: [],
    }

  static defaultProps = {
      socket: ioSocket,
      me: {
          latitude: VIE.lat,
          longitude: VIE.lng,
          rotation: Math.random() * Math.PI * 2,
          id: shortid.generate(),
          color: tinycolor({ h: 0, s: 1, l: Math.random() }).toHexString(),
          size: 10 //Math.random() * 6 + 3,
        },
      accidentAccessor: function(accident) {
        return accident.shortid
      }
  }

  _createGhostbike = (id) => {
    const color = tinycolor({ h: 0, s: 1, l: Math.random() }).toHexString()
    const ghostbike = {
        latitude: VIE.lat,
        longitude: VIE.lng,
        rotation: Math.random() * Math.PI * 2,
        id: id,
        color: color,
        size: 10 //Math.random() * 6 + 3,
      }

    return ghostbike
  }

  _onResponseRoute = (resp) => {
    console.log("on response")
    console.log(resp)
    const respId = resp.data.ghostbike.id
    let ghostbike = this.props.me
    if (respId !== this.props.me.id) {
      // if it is not me
      console.log('is not me')
      ghostbike = this.state.ghostbikes.find(ghostbike => ghostbike.id === respId )
      if (!ghostbike) {
        console.log("createing ghostbike")
        ghostbike = this._createGhostbike(respId)
        this.setState({ghostbikes: this.state.ghostbikes.concat([ghostbike])})
      }
    }
    console.log(this.state.ghostbikes)
    const polyline = {
      id: ghostbike.id,
      shape: resp.data.shape
    }
    ghostbike._trip = resp.data.trip
    ghostbike._polyline = polyline
    // move ghostbike to first point
    ghostbike.latitude = polyline.shape[0].latitude
    ghostbike.longitude = polyline.shape[0].longitude
    console.log(polyline)

    this.setState({polylines: this.state.polylines.concat([polyline])})

    this._tweenGhostbike(ghostbike)
  }

  _tweenGhostbike = (ghostbike) => {
    const values = ghostbike._polyline.shape,
       duration = ghostbike._trip.summary.time / 50,
       quantity = ghostbike._trip.summary.length

    const tween = new TweenMax(ghostbike, quantity, {
        bezier: {
            type: "soft",
            values: values,
            autoRotate: ["latitude", "longitude", "rotation", 0, true]
        },
        ease: Linear.easeNone,
        autoCSS: false,
        onUpdate: this._routeUpdated,
        onUpdateParams: [ghostbike],
        onComplete: this._routeCompleted,
        onCompleteParams: [ghostbike],
        //callbackScope: datum
    });
  }

  componentDidMount() {

    const me = this.props.me

    this.props.socket.on('response route', (data) => {
      console.log("response route")
      this._onResponseRoute(data)
    })

    window.addEventListener('resize', () => {
      this.setState({
        viewport: Object.assign({}, this.state.viewport, {
          width: window.innerWidth,
          height: window.innerHeight
        })
      });
    })

    fetch(`api/accidents`)
        .then((response) => {
            if (response.status >= 400) {
                throw new Error("Bad response from server");
            }
            return response.json();
        })
        .then((resp) => {
          this.setState({accidents: resp.data.accidents})

          this._routeCompleted(me)
          this.setState({ghostbikes: this.state.ghostbikes.concat([me])})

        })

        var loop = () => {
          /*
          this.state.data.forEach(datum => {
          })
          */
          this.forceUpdate();
          window.requestAnimationFrame(loop);


        }
        window.requestAnimationFrame(loop)


  }

  _routeCompleted = (ghostbike) => {
    //this.setState({polylines: this.state.polylines.concat([polyline])})
    console.log('route completed')
    console.log(this.props.socket)
    const route = this._getRandomAccidents(),
      data = {
        ghostbike: ghostbike,
        route: route
      }
    this.props.socket.emit('set route', data)
    console.log(this.props.socket)
  }

  _routeUpdated = (ghostbike) => {
    //console.log("update")
  }

  _getRandomAccidents = () => {
    const shuffled = this.state.accidents //arrayShuffle(this.props.accidents)
    return {
      from: this.props.accidentAccessor(shuffled[0]),
      to: this.props.accidentAccessor(shuffled[1])
    }
  }

  _onChangeViewport = (viewport) => {
    this.setState({viewport: Object.assign({}, this.state.viewport, viewport)});
  }

  render() {
    return <div>
            <Title render={prev => `${prev} | Dragon!`}/>
            <h2 className={header}>RAR!</h2>
            <MapGL {...this.state.viewport}
              onChangeViewport={this._onChangeViewport}>
              <Overlay {...this.state.viewport}
                locations={this.state.ghostbikes}
                polylines={this.state.polylines}
                accidents={this.state.accidents} />
            </MapGL>
          </div>

  }
}

export default Map
