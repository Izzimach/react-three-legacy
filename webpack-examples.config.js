var path = require('path');
var _ = require('lodash');

// copy most settings from the default config, and then modify
// the stuff that has changed

var defaultconfig = require('./webpack.config.js');
var examplesconfig = _.cloneDeep(defaultconfig);

examplesconfig.entry = path.join(__dirname, "examples", "jsxtransform", "jsxtransform.jsx");
examplesconfig.output = {
    path: path.join(__dirname, "examples/jsxtransform"),
    filename: "jsxtransform.js",
    publicPath: "/examples/jsxtransform/"
};

// add a jsx processor
examplesconfig.module.loaders.push(
  {
    test: /\.jsx$/,
    loader: 'babel',
    include: path.join(__dirname, 'examples', 'jsxtransform')
  }
);

module.exports = examplesconfig;
