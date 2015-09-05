module.exports = {
  preLoaders: [{
    test: /(\.js$|\.jsx$)/,
    exclude: /node_modules/,
    loader: 'eslint-loader'
  }],
  loaders: [
    {
      test: /\.json$/,
      loader: 'json-loader'
    },
    {
      test: /\.scss$/,
      loader: 'style!css!sass',
      include: __dirname + '/src/scss'
    },
    {
      test: /\.html$/,
      loader: "file?name=[name].[ext]",
    },
    {
      test: /\.woff/,
      loader: "url?limit=10000&mimetype=application/font-woff"
    },
    {
      test: /\.ttf/,
      loader: "url?limit=10000&mimetype=application/octet-stream"
    },
    {
      test: /\.eot/,
      loader: "file"
    },
    {
      test: /\.svg/,
      loader: "url?limit=10000&mimetype=image/svg+xml"
    },
    {
      test: /\.png/,
      loader: "file"
    }
  ],
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  eslint: {
    configFile: '.eslintrc'
  }
}
