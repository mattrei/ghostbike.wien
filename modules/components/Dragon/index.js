import document from 'global/document'
import window from 'global/window'

import React from 'react'
import ReactDOM from 'react-dom'
import dragon from './dragon.jpg'
import { header } from './styles.css'
import Title from 'react-title-component'


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


class Map extends React.Component {

  state = {
      overlay: {
        width: 700,
        height: 450,
        zoom: 0,
        mapStyle: 'mapbox://styles/mapbox/streets-v8',
        mapboxApiAccessToken: 'pk.eyJ1IjoibWF0dHJlIiwiYSI6IjRpa3ItcWcifQ.s0AGgKi0ai23K5OJvkEFnA'
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        latitude: VIE.lat,
        longitude: VIE.lng,
        mapStyle: Immutable.fromJS(mapStyle),
        zoom: 11,
        isDragging: false
      },
      polylines: [],
      ghostbikes: [],
    }

  static defaultProps = {
      accidents: [
        {id: 1, latitude: 48.18, longitude: 16.36 },
        {id: 2, latitude: 48.28, longitude: 16.42 },
        {id: 3, latitude: 48.20, longitude: 16.37 },
        {id: 4, latitude: 48.21, longitude: 16.389 },
        {id: 5, latitude: 48.1987, longitude: 16.367 },
        {id: 6, latitude: 48.2298, longitude: 16.401 },
      ]
  }

  componentDidMount() {
    window.addEventListener('resize', () => {
      this.setState({
        viewport: Object.assign({}, this.state.viewport, {
          width: window.innerWidth,
          height: window.innerHeight
        })
      });
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

        // TODO - demo
        this._onUserConnected()
  }

  _routeCompleted = (ghostbike) => {
    //console.log("completed")
    //console.log(ghostbike)

    //this.setState({polylines: this.state.polylines.concat([polyline])})

    this._driveRandomRoute(ghostbike)
  }

  _routeUpdated = (ghostbike) => {
    //console.log("update")
  }

  _driveRandomRoute = (ghostbike) => {

    const shapeToLatlng = (shape) => {
      return shape.map(s => {
        return {latitude: s[0], longitude: s[1]}
      })
    }

    const shuffled = this.props.accidents //arrayShuffle(this.props.accidents)

    var locations = `[{"lat":${shuffled[0].latitude},"lon":${shuffled[0].longitude}},{"lat":${shuffled[1].latitude},"lon":${shuffled[1].longitude}}]`
    console.log(locations)

    fetch(`//valhalla.mapzen.com/route?json=
      {"locations":${locations},
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
  }

  _onUserConnected = () => {

    const color = tinycolor({ h: 0, s: 1, l: 0.5 }).toHexString()

    const ghostbike = {
        latitude: VIE.lat,
        longitude: VIE.lng,
        rotation: Math.random() * Math.PI * 2,
        id: 'id-' + 1,
        color: color,
        size: 10 //Math.random() * 6 + 3,
      }
    this.setState({ghostbikes: this.state.ghostbikes.concat([ghostbike])})

    this._driveRandomRoute(ghostbike)
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
              <Overlay {...this.state.viewport} locations={this.state.data} />
            </MapGL>
            <Attribution />
          </div>

  }
}

export default Map
