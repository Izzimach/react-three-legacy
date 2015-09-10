var path = require('path');
var _ = require('lodash');

// copy most settings from the default config, and then modify
// the stuff that has changed

var defaultconfig = require('./webpack.config.js');

var commonjsconfig = _.cloneDeep(defaultconfig);
commonjsconfig.output.libraryTarget = "commonjs";
commonjsconfig.output.library = 'react-three';
commonjsconfig.output.filename = 'react-three-commonjs.js';


module.exports = commonjsconfig;
