var confbasic = require('./karma.conf.js');

var test_render_files = [
  'vendor/lodash.min.js',
  'build/react-three.js',
  'test/createTestFixtureMountPoint.js', // why did I make this filename so long/
  'test/basics/*.js',
  'test/components/*.js',
  'node_modules/resemblejs/resemble.js',
  'test/pixels/pixelTests.js',
  {pattern:'test/pixels/*.png',included:false, served:true} // for render tests
];

module.exports = function(config) {
  // re-use the basic configuration, and just add some more files to test
  confbasic(config);

  config.set({
    files: test_render_files
  });
};
