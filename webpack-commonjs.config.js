var path = require('path');
var _ = require('lodash');

// copy most settings from the default config, and then modify
// the stuff that has changed

var defaultconfig = require('./webpack.config.js');

var commonjsconfig = _.cloneDeep(defaultconfig);
_.assign(commonjsconfig, {
  entry: path.join(__dirname, "src", "ReactTHREE.js"),
  externals: {
    "three": "THREE"
  }
});
_.assign(commonjsconfig.output, {
  libraryTarget: "commonjs",
  library: "react-three",
  filename: "react-three-commonjs.js"
});

module.exports = commonjsconfig;
