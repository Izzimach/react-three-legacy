var path = require('path')

module.exports = {
  entry: "./src/ReactTHREE.js",

  output: {
    path: path.join(__dirname, "/dist"),
    filename: "react-three.js"
  },
  
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      include: path.join(__dirname, 'src')
    }]
  }
}
