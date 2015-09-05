var webpack = require('webpack');
var commonConfig = require('./webpack.common.js');
var loaders = [{
  test: /\.js$/,
  loader: 'babel',
  query: {
    stage: 0,
    plugins: ['./client/babelRelayPlugin']
  },
  exclude: [/node_modules/, /dependencies/]
}];
module.exports = {
  devtool: 'sourcemap',
  entry: [
    'webpack-dev-server/client?http://localhost:3000', // WebpackDevServer host and port
    'webpack/hot/only-dev-server',
    './client/src/js/bootstrap.js'
  ],
  output: {
    path: __dirname + "/../assets",
    publicPath: "http://localhost:3000/",
    filename: "js/bundle.js"
  },
  target: "web",
  module: {
    preLoaders: commonConfig.preLoaders,
    loaders: loaders.concat(commonConfig.loaders)
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  resolve: {
    alias: {
      config: __dirname + '/src/js/config/development.js'
    }
  },
  node: commonConfig.node,
  eslint: commonConfig.eslint
}
