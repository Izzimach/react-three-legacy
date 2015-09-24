//
// require and then expose React and ReactTHREE in the global namespace
//

// here we use the expose-loader of webpack. Should maybe dump this into the
// config file?

require('expose?React!react');
require('expose?ReactDOM!react-dom');
require('expose?THREE!three');


module.exports = require('./ReactTHREE.js');
