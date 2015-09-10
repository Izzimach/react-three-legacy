var path = require('path')

module.exports = {
  entry: path.join(__dirname, "src", "react-three-exposeglobals.js"),

  output: {
    path: path.join(__dirname, "build"),
    filename: "react-three.js",
    libraryTarget: "var",
    library:"ReactTHREE"
  },
  
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      include: path.join(__dirname, 'src')
    }]
  }
}
