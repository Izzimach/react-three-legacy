//
// system-level requires
//

var exec = require('child_process').exec;
var path = require('path');
var rimraf = require('rimraf');

//
// gulp-specific tools
//

var gulp = require('gulp');
var concat = require('gulp-concat');
var vsource = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var jshint = require('gulp-jshint');
var livereload = require('gulp-livereload');
var template = require('gulp-template');
var gutil = require('gulp-util');
var header = require('gulp-header');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var jsxtransform = require('gulp-react');

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
    files: ['vendor/lodash.min.js',
            BUILDPATHDEV,
            'vendor/phantomjs-shims.js', // need a shim to work with the ancient version of Webkit used in PhantomJS
            'node_modules/resemblejs/resemble.js',
            'test/createTestFixtureMountPoint.js', // why did I make this filename so long/
            'test/basics/*.js',
            'test/components/*.js',
            'test/pixels/pixelTests.js',
            {pattern:'test/pixels/*.png',included:false, served:true} // for render tests
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
  console.log('"pixelrefs" - generate pixel reference images (needs phantomjs)');
});

gulp.task('lint', ['jsxtransform'], function() {
  return gulp.src([SOURCEGLOB,EXAMPLESGLOB])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(livereload());
});

gulp.task('browserify',['lint'], function() {
  var bundler = browserify();
  bundler.require('react');
  bundler.require('three');
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
    .pipe(gulp.dest(BUILDDIR))
    .pipe(livereload());
});

gulp.task('dist-clean', function(done) {
  rimraf('dist', done);
});

// dist puts build results into dist/ for release via bower
gulp.task('dist', ['dist-clean','bundle'], function() {
  return gulp.src(['build/**'], {base:'build'})
    .pipe(gulp.dest('dist'));
});

//
// For easy use with ClojureScript (om-react-three) we need to
// arrange the files properly so that they may be properly
// packaged with leiningen. File are first arranged in dist-clojars
// and then packaged/deployed to clojars.org (currently by hand)
//

gulp.task('dist-clojars-clean', function(done) {
  rimraf('dist-clojars',done);
});

// Generate a leiningen project file for clojars. The source
// file itself is just a template so that we can fill in the
// version field. The version used is whatever is specified in package.json
gulp.task('dist-clojars-project', ['dist-clojars-clean'], function() {
  return gulp.src(['src/project_template.clj'], {base:'src'})
    .pipe(template({version:pkg.version}))
    .pipe(concat("project.clj"))
    .pipe(gulp.dest('dist-clojars/'));
  });

// put the react-three javascript files into resources/react_three so that
// cljsbuild can refer to them via {:source-paths ["react_three"]}
gulp.task('dist-clojars-src', ['dist', 'dist-clojars-clean'], function() {
  return gulp.src(['dist/**'], {base:'dist'})
    .pipe(gulp.dest('dist-clojars/resources/react_three'));
});

// Dump other files (like three.js itself) into the resources/react_three dir
// so that ring or another web-server can serve it. Such a file can be accessed
// at a '/react_three/<xxx>' URL.
gulp.task('dist-clojars-resources', ['dist-clojars-clean'], function() {
  return gulp.src(['vendor/three.js','vendor/three.min.js'], {base:'vendor'})
    .pipe(gulp.dest('dist-clojars/resources/react_three'));
});

gulp.task('dist-clojars', ['dist-clojars-src','dist-clojars-project','dist-clojars-resources'], function() {
  // user must run lein deploy in the subdir
  gutil.log('ready to deploy');
  gutil.log('chdir into the "dist-clojars" directory and run "lein deploy clojars"');
});

//
// the JSX example needs to be run through the jsx transform
//
gulp.task('jsxtransform', function() {
  return gulp.src('examples/jsxtransform/*.jsx', {base:'examples/jsxtransform'})
    .pipe(jsxtransform())
    .pipe(gulp.dest('examples/jsxtransform'))
    .pipe(livereload());
});

gulp.task('watch', ['bundle'], function() {
  gulp.watch(SOURCEGLOB, ['browserify']);
  gulp.watch(EXAMPLESGLOB, ['lint']);
  gulp.watch(['examples/jsxtransform/*.jsx'], ['jsxtransform']);
});

gulp.task('livereload', ['lint','bundle','jsxtransform'], function() {
  var nodestatic = require('node-static');
  var fileserver = new nodestatic.Server('.');
  require('http').createServer(function(request, response) {
    request.addListener('end', function() {
      fileserver.serve(request,response);
    }).resume();
  }).listen(SERVERPORT);

  livereload.listen();

  gulp.watch([SOURCEGLOB], ['bundle']);
  gulp.watch(['examples/jsxtransform/*.jsx'], ['jsxtransform']);
  gulp.watch([EXAMPLESGLOB], ['lint']);
});

gulp.task('test', ['bundle'], function() {
  karma.server.start(karmaconfiguration, function (exitCode) {
    gutil.log('Karma has exited with code ' + exitCode);
    process.exit(exitCode);
  });
});

//
// generate the bitmap references used in testing
//

gulp.task('pixelrefs', ['bundle'], function(done) {
  var command = 'phantomjs';
  var child = exec(command + ' test/pixels/generatetestrender.js',
  function(error, stdout, stderr) {
    gutil.log('result of reference image generation:\n' + stdout);
    if (stderr.length > 0) {
      gutil.log('stderr: ' + stderr);
    }
    if (error !== null) {
      gutil.log('exec error: ' + error);
    }
    done();
  });
});

gulp.task('default', ['lint','bundle']);
