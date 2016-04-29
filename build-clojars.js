//
// generate directory tree so that the js code can be
// deployed to clojars.org for use as a clojurescript library
//
// after running this script you need to cd into dist-clojars/ and
// run 'lein deploy'

var fs = require('fs');
var rimraf = require('rimraf');
var _ = require('lodash');
var pkg = require('./package.json');

//
// for deploy to clojars we need:
// - project.clj with the version set properly
// - src/deps.cljs
// - react-three code in react_three
//
// we should really make minimized versions and an extern file, but for
// now we'll just use the default js file

var copystuff = function(frompath, topath) {
  fs.createReadStream(frompath).pipe(fs.createWriteStream(topath));
};

// first nuke the current dist-clojars and rebuild directories
rimraf('dist-clojars', function (err) {
  if (err) { console.log('Error removing old dist-clojars'); }
  else {
    fs.mkdirSync('dist-clojars');
    fs.mkdirSync('dist-clojars/src');
    fs.mkdirSync('dist-clojars/src/react_three');

    // copy over deps.cljs
    copystuff('src/deps.cljs', 'dist-clojars/src/deps.cljs');
    
    // copy over react-three code
    copystuff('build/react-three.js', 'dist-clojars/src/react_three/react-three.js');
    
    // copy project.clj and insert version
    var projectfile_template = _.template(fs.readFileSync('src/project_template.clj'));
    var projectfile_formatted = projectfile_template(pkg);
    fs.writeFileSync('dist-clojars/project.clj', projectfile_formatted);
  }
});


