var test_basic_files = [
  'vendor/lodash.min.js',
  'build/react-three.js',
  'test/createTestFixtureMountPoint.js', // why did I make this filename so long/
  'test/basics/*.js'
];

module.exports = function(config) {
  config.set({
    browsers: ['Firefox'],
    frameworks:['jasmine'],
    files: test_basic_files,
    singleRun:true
  });
};
