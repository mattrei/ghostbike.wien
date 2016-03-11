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
      socket: io('//localhost:8082'),
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

  _onResponseRoute = (route) => {
    const respId = route.ghostbike.id
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
      shape: decode(route.trip.legs[0].shape)
    }
    ghostbike._trip = route.trip
    ghostbike._polyline = polyline
    ghostbike.latitude = polyline.shape[0][0]
    ghostbike.longitude = polyline.shape[0][1]


    // set all points to visible = ffalse
    polyline.shape.forEach(point => {
      point.push(true) // 3rd element is visiblity
    })
    console.log(polyline)

    this.setState({polylines: this.state.polylines.concat([polyline])})

    const values = shapeToLatlng(ghostbike._polyline.shape)
    const duration = ghostbike._trip.summary.time / 50
    const quantity = ghostbike._trip.summary.length

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

    this.setState({ghostbikes: this.state.ghostbikes.concat([me])})

    this.props.socket.on('response route', (route) => {
      this._onResponseRoute(route)
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

          const route = this._getRandomAccidents()
          const data = {
            data: {
              ghostbike: me,
              route: route
            }
          }
          this.props.socket.emit('set route', data)
          this._driveRoute(me, route)
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

    const route = this._getRandomAccidents(),
      data = {
        ghostbike: ghostbike,
        route: route.route
      }
    this.props.socket.emit('set route', data)

    this._driveRoute(ghostbike, route)
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

  _tweenGhostbike = (ghostbike) => {
    const values = shapeToLatlng(ghostbike._polyline.shape)
    const duration = ghostbike._trip.summary.time / 50
    const quantity = ghostbike._trip.summary.length

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

  _driveRoute = (ghostbike, route) => {

    const shapeToLatlng = (shape) => {
      return shape.map(s => {
        return {latitude: s[0], longitude: s[1]}
      })
    }
/*
    fetch(`//valhalla.mapzen.com/route?json=
      {"locations":${route.locations},
        "costing":"bicycle",
        "costing_options":{"bicycle":{"bicycle_type":"road"}},
        "directions_options":{"units":"kilometers"}}&api_key=${API_KEY}`)
        .then((response) => {
            if (response.status >= 400) {
                throw new Error("Bad response from server");
            }
            return response.json();
        })
        .then((route) => {
          console.log(route)
            const polyline = {
              id: ghostbike.id,
              shape: decode(route.trip.legs[0].shape)
            }
            ghostbike._trip = route.trip
            ghostbike._polyline = polyline
            ghostbike.latitude = polyline.shape[0][0]
            ghostbike.longitude = polyline.shape[0][1]


            // set all points to visible = ffalse
            polyline.shape.forEach(point => {
              point.push(true) // 3rd element is visiblity
            })
            console.log(polyline)

            this.setState({polylines: this.state.polylines.concat([polyline])})

            const values = shapeToLatlng(ghostbike._polyline.shape)
            const duration = ghostbike._trip.summary.time / 50
            const quantity = ghostbike._trip.summary.length

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


        })
        */

  }

  _onUserConnected = () => {


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
