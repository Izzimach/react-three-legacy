var path = require('path');

module.exports = {
  entry: path.join(__dirname, "src", "react-three-exposeglobals.js"),

  output: {
    path: path.join(__dirname, "build"),
    publicPath: "/build/",
    filename: "react-three.js",
    libraryTarget: "var",
    library:"ReactTHREE"
  },
  
  module: {
    loaders: [
      {
	test: /\.js$/,
	loader: 'babel',
	include: path.join(__dirname, 'src'),
	query: {
	  // When generating a standalone library, this makes sure to
	  // use babel-runtime to wrap our code and
	  // avoid global polyfills.
	  optional: ['runtime']
	}
      }
    ]
  }
}
