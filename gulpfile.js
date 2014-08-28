//
// system-level requires
//

var exec = require('child_process').exec;
var path = require('path');

//
// gulp-specific tools
//

var gulp = require('gulp');
var concat = require('gulp-concat');
var vsource = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var jshint = require('gulp-jshint');
var livereload = require('gulp-livereload');
var gutil = require('gulp-util');
var header = require('gulp-header');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

//
// testing/packaging
//

var karma = require('karma');
var browserify = require('browserify');
var pkg = require('./package.json');

//
// config for the web server used to serve examples
//

var SERVERPORT = 8080;
var SOURCEGLOB = './src/**/*.js';
var EXAMPLESGLOB = './examples/**/*.js';

//
// BUILDFILExxx is the file name,
// BUILDPATHxxx is the full path: <BUILDDIR>/<BUILDFILExxx>
//

var BUILDDIR = 'build';
var BUILDFILENAME = 'react-three';
var MODULENAME = 'react-three';

var BUILDFILEDEV = BUILDFILENAME + '.js';
var BUILDPATHDEV = path.join(BUILDDIR, BUILDFILEDEV);

var BUILDFILEMIN = BUILDFILENAME + '.min.js';
var BUILDPATHMIN = path.join(BUILDDIR, BUILDFILEMIN);

var banner = ['/**',
             ' * <%= pkg.name %>',
             ' * @version <%= pkg.version %>',
             ' * @license <%= pkg.license %>',
             ' */',
             ''].join('\n');

var browserlist = ['Firefox'];
var karmaconfiguration = {
    browsers: browserlist,
    files: ['vendor/three.js',
            BUILDPATHDEV,
            'vendor/phantomjs-shims.js', // need a shim to work with the ancient version of Webkit used in PhantomJS
           ],
    frameworks:['jasmine'],
    singleRun:true
};

function errorHandler(err) {
  gutil.log(err);
  this.emit('end'); // so that gulp knows the task is done
}

gulp.task('help', function() {
  console.log('Possible tasks:');
  console.log('"default" - compile ' + pkg.name + ' into ' + BUILDPATHDEV);
  console.log('"watch" - watch ' + pkg.name + ' source files and rebuild');
  console.log('"test" - run tests in test directory');
  console.log('"livereload" - compile and launch web server/reload server');
});

gulp.task('lint', function() {
  return gulp.src([SOURCEGLOB,EXAMPLESGLOB])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('browserify',['lint'], function() {
  var bundler = browserify();
  bundler.require('react');
  bundler.require('./src/ReactTHREE.js',{expose:MODULENAME});

  return bundler.bundle().on('error', errorHandler)
    .pipe(vsource('react-three-commonjs.js'))
    .pipe(gulp.dest('build'));
});

gulp.task('bundle', ['browserify'], function() {

  // If we're running a gulp.watch and browserify finds and error, it will
  // throw an exception and terminate gulp unless we catch the error event.
  return gulp.src(['build/react-three-commonjs.js','src/react-three-exposeglobals.js'])
    .pipe(concat(BUILDFILEDEV))
    .pipe(gulp.dest('build'))

     // might as well compress it while we're here

    .pipe(streamify(uglify({preserveComments:'some'})))
    .pipe(rename(BUILDFILEMIN))
    .pipe(gulp.dest(BUILDDIR));
});

gulp.task('watch', ['bundle'], function() {
  gulp.watch(SOURCEGLOB, ['browserify']);
  gulp.watch(EXAMPLESGLOB, ['lint']);
});

gulp.task('livereload', ['lint','bundle'], function() {
  var nodestatic = require('node-static');
  var fileserver = new nodestatic.Server('.');
  require('http').createServer(function(request, response) {
    request.addListener('end', function() {
      fileserver.serve(request,response);
    }).resume();
  }).listen(SERVERPORT);

  var livereloadserver = livereload();

  gulp.watch([SOURCEGLOB], ['bundle']);
  gulp.watch([EXAMPLESGLOB], ['lint']);
  gulp.watch(['build/**/*.js', 'examples/**/*.js','examples/**/*.html'], function(file) {
    livereloadserver.changed(file.path);
  });
});

gulp.task('test', ['bundle'], function() {
  karma.server.start(karmaconfiguration, function (exitCode) {
    gutil.log('Karma has exited with code ' + exitCode);
    process.exit(exitCode);
  });
});

gulp.task('default', ['lint','bundle']);

