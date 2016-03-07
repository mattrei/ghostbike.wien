var webpack = require('webpack')
var path = require('path')
var conf = require('react-project/webpack')

conf.ClientDevConfig.module.postLoaders = [
  {
    include: path.resolve(__dirname, 'node_modules/pixi.js'),
    loader: 'transform?brfs'
  }
]

conf.ClientDevConfig.resolve = {
    extensions: ['', '.js', '.jsx'],
    alias: {
      webworkify: 'webworkify-webpack',
      TweenMax: 'gsap/src/uncompressed/TweenMax.js',
    }
  }

conf.ClientDevConfig.plugins.push(
  new webpack.ProvidePlugin({TweenMax: "TweenMax"})
)

conf.ClientDevConfig.module.loaders.push(
  {
  test: /\.js$/,
  include: path.resolve(__dirname, 'node_modules/mapbox-gl/js/render/shaders.js'),
  loader: 'transform/cacheable?brfs'
})
conf.ClientDevConfig.module.loaders.push(
{
  test: /\.js$/,
  include: path.resolve(__dirname, 'node_modules/webworkify/index.js'),
  loader: 'worker'
}
)

conf.ClientDevConfig.module.node =  {
    console: true,
    fs: "empty"
  }



console.log(conf.ClientDevConfig)


conf.ClientProdConfig.module.postLoaders = [
  {
    include: path.resolve(__dirname, 'node_modules/pixi.js'),
    loader: 'transform?brfs'
  }
]

conf.ClientProdConfig.resolve = {
    extensions: ['', '.js', '.jsx'],
    alias: {
      webworkify: 'webworkify-webpack'
    }
  }

conf.ClientProdConfig.module.loaders.push(
  {
  test: /\.js$/,
  include: path.resolve(__dirname, 'node_modules/mapbox-gl/js/render/shaders.js'),
  loader: 'transform/cacheable?brfs'
})
conf.ClientProdConfig.module.loaders.push(
{
  test: /\.js$/,
  include: path.resolve(__dirname, 'node_modules/webworkify/index.js'),
  loader: 'worker'
}
)

conf.ClientProdConfig.module.node =  {
    console: true,
    fs: "empty"
  }

module.exports = conf
