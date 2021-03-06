var React = require('react');
var window = require('global/window');
var r = require('r-dom');
var PIXI = require('pixi.js'),
  particles = require('pixi-particles');
var browser = require('bowser');
var ViewportMercator = require('viewport-mercator-project');
var prefix = browser.webkit ? '-webkit-' : browser.gecko ? '-moz-' : '';

const RADIUS = {GHOSTBIKE: 10, ACCIDENT: 5}

module.exports = React.createClass({

  displayName: 'Overlay',

  propTypes: {
    locations: React.PropTypes.array.isRequired,
    polylines: React.PropTypes.array.isRequired,
    accidents: React.PropTypes.array.isRequired,

    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    longitude: React.PropTypes.number.isRequired,
    latitude: React.PropTypes.number.isRequired,
    zoom: React.PropTypes.number.isRequired,
    isDragging: React.PropTypes.bool.isRequired,

    lngLatAccessor: React.PropTypes.func.isRequired,
    keyAccessor: React.PropTypes.func.isRequired,
    polylineAccessor: React.PropTypes.func.isRequired,
    accidentAccessor: React.PropTypes.func.isRequired,

    sizeAccessor: React.PropTypes.func.isRequired,
    colorAccessor: React.PropTypes.func.isRequired,
  },

  getDefaultProps: function getDefaultProps() {
    return {
      lngLatAccessor: function lngLatAccessor(location) {
        return [location.longitude, location.latitude];
      },
      keyAccessor: function keyAccessor(location) {
        return String(location.id);
      },
      sizeAccessor: function sizeAccessor(location) {
        return location.size;
      },
      colorAccessor: function sizeAccessor(location) {
        return 0xff00ff;
      },
      polylineAccessor: function polylineAccessor(polyline) {
        return polyline.id;
      },
      accidentAccessor: function polylineAccessor(accident) {
        return accident.shortid;
      },
      locations: [],
      polylines: [],
      accidents: [],
    };
  },

  _createPIXIRenderer: function _createPIXIRenderer() {
    return new PIXI.WebGLRenderer(this.props.width, this.props.height, {
      antialias: true,
      transparent: true,
      resolution: window.devicePixelRatio || 1,
      view: this.refs.overlay
    });
  },

  componentDidMount: function componentDidMount() {
    this._renderer = this._createPIXIRenderer();
    this._stage = new PIXI.Container();
    //this._stage = new PIXI.Stage(0x66FF99, true)

    this._locationsContainer = new PIXI.Container();
    this._stage.addChild(this._locationsContainer);
    this._locations = [];

    this._polylinesContainer = new PIXI.Container();
    this._stage.addChild(this._polylinesContainer);
    this._polylines = [];

    this._accidentsContainer = new PIXI.Container();
    this._stage.addChild(this._accidentsContainer);
    this._accidents = [];

    this._elapsed = Date.now()

    this._setupParticles()
    this._updateScene();
    this._redraw();
  },

  _setupParticles() {
    this._gasEmitter = new PIXI.particles.Emitter(
      this._stage,
      [PIXI.Texture.fromImage('particles/particle.png'),
       PIXI.Texture.fromImage('particles/smokeparticle.png')],
       {
					"alpha": {
						"start": 0.4,
						"end": 0
					},
					"scale": {
						"start": 2,
						"end": 0.4
					},
					"color": {
						"start": "6bff61",
						"end": "d8ff4a"
					},
					"speed": {
						"start": 10,
						"end": 10
					},
					"startRotation": {
						"min": 0,
						"max": 360
					},
					"rotationSpeed": {
						"min": 0,
						"max": 0
					},
					"lifetime": {
						"min": 2,
						"max": 1.8
					},
					"blendMode": "screen",
					"frequency": 0.01,
					"emitterLifetime": 0,
					"maxParticles": 1000,
					"pos": {
						"x": 0.5,
						"y": 0.5
					},
					"addAtBack": true,
					"spawnType": "circle",
					"spawnCircle": {
						"x": 0,
						"y": 0,
						"r": 150
					}
				})

    console.log(this._gasEmitter)

    this._elapsed -= Date.now()
    this._gasEmitter.update(this._elapsed * 0.001)
    this._gasEmitter.updateOwnerPos(100, 100)
    this._gasEmitter.emit = true
  },

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    if (newProps !== this.props.location) {
      this._locationsDirty = true;
    }
  },

  componentDidUpdate: function componentDidUpdate() {
    if (this._locationsDirty) {
      this._updateScene();
    }
    this._locationsDirty = false;
    this._redraw();
  },

  _updateAccidents: function () {

    const radius = 10 //TODO

    var added = [];
    var incomingHash = {};
    if (this.props.accidents) {
      added = this.props.accidents.filter(accident => {
        var key = this.props.accidentAccessor(accident);
        incomingHash[key] = true;
        return !this._accidents[key];
      })
    }
    var removed = Object.keys(this._accidents).filter(key => {
      return !incomingHash[key];
    });

    added.forEach(accident => {
      var graphics = new PIXI.Graphics();
      graphics.beginFill(0xff0000, 0.8);
      graphics.drawCircle(0, 0, radius /*this.props.sizeAccessor(location)*/);
      graphics.endFill();
      var node = new PIXI.Container();
      node.addChild(graphics);
      node._data = accident;
      node._graphics = graphics
      node._radius = radius
      this._accidentsContainer.addChild(node);
      var key = this.props.accidentAccessor(accident);
      this._accidents[key] = node;
    })
    removed.forEach((node, key) => {
      this._stage.accidents.removeChild(node);
      delete this._accidents[key];
    })
  },

  _updatePolylines: function () {
    var added = []
    var incomingHash = {};
    if (this.props.polylines) {
      added = this.props.polylines.filter(polyline => {
        var key = this.props.polylineAccessor(polyline);
        incomingHash[key] = true;
        return !this._polylines[key];
      })
    }
    const removed = Object.keys(this._polylines).filter(key => {
      return !incomingHash[key];
    })

    added.forEach(polyline => {
      const graphics = new PIXI.Graphics();
      var node = new PIXI.Container();
      node.addChild(graphics);
      node._data = polyline;
      node._line = graphics

      this._polylinesContainer.addChild(node);
      var key = this.props.polylineAccessor(polyline);

      this._polylines[key] = node;
    })
    removed.forEach((node, key) => {
      this._stage.polylines.removeChild(node);
      delete this._polylines[key];
    })
  },

  _updateLocations: function() {
    var added = [];
    var incomingHash = {};
    if (this.props.locations) {
      added = this.props.locations.filter(function filter(location) {
        var key = this.props.keyAccessor(location);
        incomingHash[key] = true;
        return !this._locations[key];
      }.bind(this));
    }

    var removed = Object.keys(this._locations).filter(function filter(key) {
      return !incomingHash[key];
    });

    added.forEach(location => {
      var graphics = new PIXI.Graphics();
      graphics.beginFill(0xff00ff, 0.8);
      graphics.drawCircle(0, 0, this.props.sizeAccessor(location));
      graphics.endFill();
      var node = new PIXI.Container();
      node.addChild(graphics);
      node._data = location;
      this._locationsContainer.addChild(node);
      var key = this.props.keyAccessor(location);
      this._locations[key] = node;
    })
    removed.forEach((node, key) => {
      this._stage.locations.removeChild(node);
      delete this._locations[key];
    })
    this._locationsDirty = false;
  },

  _updateScene: function _updateScene() {

    this._updateLocations()
    this._updatePolylines()
    this._updateAccidents()
  },

  _redrawPolylines: function(mercator) {
    Object.keys(this._polylines).forEach((key, j) => {
      var node = this._polylines[key];

      var lastPixel = null
      node._line.clear()
      node._line.lineStyle(5, 0xff0000);

      node._data.shape.forEach((point, i) => {
        var lngLat = [point.longitude, point.latitude]
        var pixel = mercator.project(lngLat)
        if (lastPixel) {
          node._line.moveTo(lastPixel[0], lastPixel[1])
          node._line.lineTo(pixel[0], pixel[1])
        }
        lastPixel = pixel
      })
    })
  },

  _redrawAccidents: function(mercator) {
    Object.keys(this._accidents).forEach((key, i) => {
      var node = this._accidents[key];
      const accident = node._data
      var lngLat = [accident.longitude, accident.latitude]
      var pixel = mercator.project(lngLat);
      node.position.x = pixel[0];
      node.position.y = pixel[1];


      //console.log(node._graphics)
      const g = node._graphics
      g.interactive = true
      g.hitArea = new PIXI.Circle(0,0,node._radius)
      g.mouseover = this._onAccidentClick
      g._data = node._data
    })
  },

  _onAccidentClick: function(e) {
    console.log(e.target._data.shortid)

  },

  _redrawLocations: function(mercator) {
    const railSize = 30

    const radius = RADIUS.GHOSTBIKE * this.props.dotRadius

    Object.keys(this._locations).forEach((key, i) => {
      var node = this._locations[key];
      var lngLat = this.props.lngLatAccessor(node._data);
      var pixel = mercator.project(lngLat);
      //node.position.x = pixel[0];
      //node.position.y = pixel[1];


      var circle = new PIXI.Graphics();
      circle.beginFill(0xff00ff,1.0);
      circle.drawCircle(0,0, radius);
      circle.endFill();
      circle.x = pixel[0]
      circle.y = pixel[1]
      node.addChild(circle);

      circle.interactive = true
      circle.hitArea = new PIXI.Circle(circle.x,circle.y,radius)
      circle.mouseover = this._onAccidentClick

      // fade out older childs
      if (node.children.length > railSize) {
        node.removeChildAt(0);
      }
      var len = node.children.length;
      while (len--) {
          node.children[len].alpha -= 0.05
      }

      //this._gasEmitter.update(this._elapsed * 0.001)
      //this._gasEmitter.updateOwnerPos(pixel[0], pixel[1])
      //this._gasEmitter.emit = true

    })
  },

  _redraw: function _redraw() {

    this._elapsed = Date.now() - this._elapsed

    const mercator = ViewportMercator(this.props);
    this._renderer.resize(this.props.width, this.props.height);
    this._redrawLocations(mercator)
    this._redrawPolylines(mercator)
    this._redrawAccidents(mercator)
    this._renderer.render(this._stage);
  },

  render: function render() {
    var pixelRatio = window.devicePixelRatio;
    return r.canvas({
      ref: 'overlay',
      width: this.props.width * pixelRatio,
      height: this.props.height * pixelRatio,
      style: {
        width: this.props.width + 'px',
        height: this.props.height + 'px',
        position: 'absolute',
        pointerEvents: 'all',
        cursor: this.props.isDragging ? prefix + 'grabbing' : prefix + 'grab',
        left: 0,
        top: 0
      }
    });
  }
});
