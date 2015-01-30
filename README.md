react-three
===========

[![Build Status](https://travis-ci.org/Izzimach/react-three.svg?branch=master)](https://travis-ci.org/Izzimach/react-three)

Create/control a [three.js](http://threejs.org/) canvas using [React](https://github.com/facebook/react).

To use React for drawing 2D using WebGL, try [react-pixi](https://github.com/Izzimach/react-pixi).

You can view an interactive demo (hopefully) at [my github demo page](http://izzimach.github.io/demos/react-three-interactive/index.html). This demo is also available as a standalone project at [r3test](https://github.com/Izzimach/r3test/)

## Install and Use with npm

If you are building a project with a `package.json` file you can
```
npm install react --save
npm install react-three --save
```

and then access the extensions via a `require` expression:

```
var React = require('react');
var ReactTHREE = require('react-three');
var THREE = require('three');
```

## Building Standalone Files

Checkout the git repository. You will need node and npm. You should probably install gulp globally as well.

```
git clone https://github.com/Izzimach/react-three.git
cd react-three
npm install -g gulp
npm install
```

At this point, simply running

```
gulp
```

Will package up the react-three components along with React and put the result in build/react-three.js. If you include this into your webpage via
a script tag:

```
<script src="react-three.js"></script>
```

Then ```React``` will appear in the global namespace and the new React-THREE components are available as ```ReactTHREE```. Note that
you'll still have to load three.js with a separate call to require().


![Sample Cupcake component](docs/react-three-interactiveexample.png)

## Examples

Examples are set up in the examples/ directory. You can run

```
gulp livereload
```

Then open the example index in your browser at `http://localhost:8080/`

## Testing

You can run tests using gulp:

```
gulp test
```

To generate the pixel reference images you need to install phantomjs and run

```
gulp pixelrefs
```

