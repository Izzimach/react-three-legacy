react-three
===========

Create/control a [three.js](http://threejs.org/) canvas using [React](https://github.com/facebook/react).


![Sample Cupcake component](docs/react-three-interactiveexample.png)


## Installation

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
