var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.dev.config.js');

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  contentBase: 'client/src',
  inline: true,
  hot: true,
  stats: {colors: true},
  quiet: false,
  colors: true,
  noInfo: false,
  historyApiFallback: true,
  proxy: {'/graphql': 'http://localhost:1337'},
}).listen(3000, '0.0.0.0', function(err) {
  if(err) {
    console.log(err);
  }
  console.log('webpack dev server listening on localhost:3000');
});
