var path = require('path');
var _ = require('lodash');

var defaultconfig = require('./webpack.config.js');

var commonjsconfig = _.cloneDeep(defaultconfig);
commonjsconfig.output.libraryTarget = "commonjs";
commonjsconfig.output.library = 'react-three';
commonjsconfig.output.filename = 'react-three-commonjs.js';


module.exports = commonjsconfig;
