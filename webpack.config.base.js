"use strict";

var webpack = require("webpack");

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: [["es2015", { modules: false }]]
        }
      }
    ]
  },
  output: {
    library: "WaterlineToGraphQL",
    libraryTarget: "umd"
  },
  resolve: {
    extensions: [".js"]
  }
};
