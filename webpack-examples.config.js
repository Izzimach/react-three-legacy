var path = require('path');
var _ = require('lodash');

// copy most settings from the default config, and then modify
// the stuff that has changed

var defaultconfig = require('./webpack.config.js');
var examplesconfig = _.cloneDeep(defaultconfig);

var examplesdirectory = path.join(__dirname, "examples");

examplesconfig.entry = {
  jsxtransform: path.join(examplesdirectory, "jsxtransform", "jsxtransform.jsx"),
  shader: path.join(examplesdirectory, 'shader', 'shader.jsx')
};

examplesconfig.output = {
  path: path.join(__dirname, "examples", "build"),
  filename: "[name].js",
  publicPath: "/examples/build/"
};

// add a jsx processor
examplesconfig.module.loaders.push(
  {
    test: /\.jsx$/,
    loader: 'babel',
    include: path.join(__dirname, 'examples'),
    query: {
      cacheDirectory: true,
      presets: ['es2015', 'stage-2', 'react'],
      plugins: ['transform-runtime']
    }
  }
);

examplesconfig.devtool = 'cheap-module-eval-source-map',

module.exports = examplesconfig;
