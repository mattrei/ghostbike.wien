var webpack = require('webpack')
var path = require('path')
var conf = require('react-project/webpack')

conf.ClientConfig.module.postLoaders = [
  {
    include: path.resolve(__dirname, 'node_modules/pixi.js'),
    loader: 'transform?brfs'
  }
]

conf.ClientConfig.resolve = {
    extensions: ['', '.js', '.jsx'],
    alias: {
      webworkify: 'webworkify-webpack',
      TweenMax: 'gsap/src/uncompressed/TweenMax.js',
    }
  }

conf.ClientConfig.plugins.push(
  new webpack.ProvidePlugin({TweenMax: "TweenMax"})
)

conf.ClientConfig.module.loaders.push(
  {
  test: /\.js$/,
  include: path.resolve(__dirname, 'node_modules/mapbox-gl/js/render/shaders.js'),
  loader: 'transform/cacheable?brfs'
})
conf.ClientConfig.module.loaders.push(
{
  test: /\.js$/,
  include: path.resolve(__dirname, 'node_modules/webworkify/index.js'),
  loader: 'worker'
}
)

conf.ClientConfig.module.node =  {
    console: true,
    fs: "empty"
  }



//console.log(conf.ClientConfig)


module.exports = conf
