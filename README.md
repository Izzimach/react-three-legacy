react-three
===========

Create/control a [three.js](http://threejs.org/) canvas using [React](https://github.com/facebook/react).

You can view an interactive demo (hopefully) at [my github demo page](http://izzimach.github.io/demos/react-three-interactive/index.html). This demo is also available as a standalone project at [r3test](https://github.com/Izzimach/r3test/)

## Install and Use

If you are building a project with a `package.json` file you can
```
npm install react --save
npm install react-three --save
```

and then access the extensions via a `require` expression:

```
var React = require('react');
var ReactTHREE = require('react-three');
```

Note that this does not include three.js so you'll still need to find
and include one of the three.js files yourself, either by building your own copy or via something like bower.

## Building Standalone Files

You will need node and npm. You should probably install gulp globally as well.

```
npm install -g gulp
npm install
```

Simply running

```
gulp
```

Will package up the react-three components along with React and put the result in build/react-three.js. If you include this into your webpage via
a script tag:

```
<script src="react-three.js"></script>
```

Then ```React``` will appear in the global namespace and the new React-THREE components are available as ```ReactTHREE```. Note that
you'll still have to load three.js with a separate script tag.


![Sample Cupcake component](docs/react-three-interactiveexample.png)

## Examples

Examples are set up in the examples/ directory. You can run

```
gulp livereload
```

Then open various examples in your browser:

```
http://localhost:8080/cupcake/cupcake.html
http://localhost:8080/interactive/interactive.html
```

There should probably be something in place to generate an index.html
containing all of the examples. Oh well.

## Testing

No testing yet!
