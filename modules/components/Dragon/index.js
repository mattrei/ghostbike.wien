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

var Immutable = require('immutable');

import Overlay from './overlay'

import Attribution from './attribution'
var rasterTileStyle = require('raster-tile-style');
var tileSource = '//tile.stamen.com/toner/{z}/{x}/{y}.png';
var mapStyle = rasterTileStyle([tileSource], 512);

class Map extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      overlay: {
        width: 700,
        height: 450,
        zoom: 0,
        mapStyle: 'mapbox://styles/mapbox/streets-v8',
        mapboxApiAccessToken: 'pk.eyJ1IjoibGFmaW4iLCJhIjoiY2lrbjQ2cWs4MDA4YXcwbTRhOWZ0a2UwZSJ9.uWxtYDe0xyX4ZnilLQWcig'
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        latitude: 37.7833,
        longitude: -122.4167,
        mapStyle: Immutable.fromJS(mapStyle),
        zoom: 11,
        isDragging: false
      }
    };
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
    var data = [];
    var spread = 0.01;
    for (var i = 0; i < 5; i++) {
      data.push({
        latitude: 37.7833 + Math.random() * spread - spread / 2,
        longitude: -122.4167 + Math.random() * spread - spread / 2,
        rotation: Math.random() * Math.PI * 2,
        id: 'id-' + i,
        size: Math.random() * 6 + 3
      });
    }
    this.setState({data: data});
    var loop = function _loop() {
      this.state.data.forEach(function each(datum) {
        var ll = [datum.longitude, datum.latitude];
        var diff = Math.random() * Math.PI / 5 - Math.PI / 10;
        datum.rotation += diff;
        var step = 0.0005;
        ll[0] += Math.sin(datum.rotation) * step;
        ll[1] += Math.cos(datum.rotation) * step;
        datum.longitude = ll[0];
        datum.latitude = ll[1];
      });
      this.forceUpdate();
      window.requestAnimationFrame(loop);
    }.bind(this);
    window.requestAnimationFrame(loop);
  }

  _onChangeViewport(viewport) {
    this.setState({viewport: Object.assign({}, this.state.viewport, viewport)});
  }

  render() {
    /*
    return r.div([
      r(MapGL, Object.assign({}, this.state.viewport, {
        onChangeViewport: this._onChangeViewport
      }), [
        r(Overlay, Object.assign({}, this.state.viewport, {
          locations: this.state.data
        }))
      ]),
      r(Attribution)
    ]);
    */

    return <div>
            <Title render={prev => `${prev} | Dragon!`}/>
            <h2 className={header}>RAR!</h2>
            <MapGL {...this.state.viewport}
              onChangeViewport={this._onChangeViewport.bind(this)}>
              <Overlay {...this.state.viewport} locations={this.state.data} />
            </MapGL>
            <Attribution />
          </div>

  }
}

export default Map
