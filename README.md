react-three
===========

[![Build Status](https://travis-ci.org/Izzimach/react-three.svg?branch=master)](https://travis-ci.org/Izzimach/react-three)

Create/control a [three.js](http://threejs.org/) canvas using [React](https://github.com/facebook/react).

To use React for drawing 2D using WebGL, try [react-pixi](https://github.com/Izzimach/react-pixi).

You can view an interactive demo (hopefully) at [my github demo page](http://izzimach.github.io/demos/react-three-interactive/index.html). This demo is also available as a standalone project at [r3test](https://github.com/Izzimach/r3test/)

## Usage

An example render functions from the examples:

```javascript
render: function() {
  var MainCameraElement = React.createElement(
    ReactTHREE.PerspectiveCamera,
    {name:'maincamera', fov:'75', aspect:this.props.width/this.props.height,
     near:1, far:5000,
     position:new THREE.Vector3(0,0,600), lookat:new THREE.Vector3(0,0,0)});

  return React.createElement(
      ReactTHREE.Scene,
      {width:this.props.width, height:this.props.height, camera:'maincamera'},
      MainCameraElement,
      React.createElement(Cupcake, this.props.cupcakedata)
  );
}
```

or if you want to use JSX,

```javascript
render: function() {
  var aspectratio = this.props.width / this.props.height;
  var cameraprops = {fov:75, aspect:aspectratio, near:1, far:5000,
    position:new THREE.Vector3(0,0,600), lookat:new THREE.Vector3(0,0,0)};

  return  <Scene width={this.props.width} height={this.props.height} camera="maincamera">
            <PerspectiveCamera name="maincamera" {...cameraprops} />
            <Cupcake {...this.props.cupcakedata} />
          </Scene>;
}
```

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

Will package up the react-three components along with React and put the result in
build/react-three.js. If you include this into your webpage via a script tag:

```
<script src="react-three.js"></script>
```

Then the relevant parts will be accessed in the global namespace as `React`, `ReactTHREE`, and `THREE`.

![Sample Cupcake component](docs/react-three-interactiveexample.png)

## Examples

Examples are set up in the examples/ directory. You can run

```
gulp livereload
```

Then open the example index in your browser at `http://localhost:8080/`

## Testing

Certain tests require WebGL and cannot be run on the CI test server. Because of
this, it is recommended that you run the tests locally before submitting a pull request.

You can run tests using gulp:

```
gulp test
```

Certain tests compare results to know correct reference images.
If for some reason you need to generate (or regenerate) the pixel reference images
you need to install phantomjs and run

```
gulp pixelrefs
```
