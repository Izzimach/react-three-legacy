//
// Basic ReactTHREE example using events to add/remove sprites.

// tell jshint that we use lodash
/* global _ : false */
/* global React : false */
/* global ReactTHREE : false */
/* jshint strict: false */

var g_assetpath = function(filename) { return '../assets/' + filename; };


//
// This 'application' tracks a bunch of cubes.
// You can do two things:
// 1. add a new randomly-placed cube to the application state
// 2. remove a specific cube, specified by the cube id
//


// the mounted instance will go here, so that callbacks can modify/set it
var g_reactinstance;

// This basically the 'application state':
// a list of all the current sprites
var g_applicationstate = {};

var g_nextcubeid = 1;

// if the application state is modified call this to update the GUI

function updateApp() {
  g_reactinstance.setProps(g_applicationstate);
}

//
// callback which adds a randomly placed cube to the application state
//

function addRandomCube() {
  // give each sprite a unique ID
  var refnumber = g_nextcubeid++;
  var cubeid = 'cube' + refnumber.toString();

  var newcube = {
    position: new THREE.Vector3(
      (Math.random() - 0.5) * g_applicationstate.xsize,
      (Math.random() - 0.5) * g_applicationstate.ysize,
      (Math.random() - 0.5) * g_applicationstate.zsize
    ),
    materialname: g_assetpath('lollipopGreen.png'),
    key: cubeid,
    name: cubeid
  };

  g_applicationstate.cubes.push(newcube);

  // update and re-render
  updateApp();
}

//
// callback to remove the dynamic cube that was clicked on
//

function removeCubeById(cubeid) {
  var isthecube = function(cube) { return cube.key === cubeid; };
  _.remove(g_applicationstate.cubes, isthecube);

  updateApp();
}




//
// React Components follow
//


//
// Component to represent a clickable cube with a given texture
// the box geometry is shared!
// materials are generated and cached here. Normally you would want to
// come up with a more general purpose asset manager...
//

var boxgeometry = new THREE.BoxGeometry( 200,200,200);

var boxmaterialcache = [];
function lookupmaterial(materialname) {
  var material = _.find(boxmaterialcache, function(x) { return x.name === materialname;});
  if (typeof material !== "undefined") { return material; }

  // not found. create a new material for the given texture
  var texturemap = THREE.ImageUtils.loadTexture( g_assetpath(materialname) );
  var newmaterial = new THREE.MeshBasicMaterial( { map: texturemap } );
  newmaterial.name = materialname;

  boxmaterialcache.push(newmaterial);
  return newmaterial;
}

var ClickableCube = React.createClass({
  displayName: 'ClickableCube',
  propTypes: {
    position: React.PropTypes.instanceOf(THREE.Vector3),
    materialname: React.PropTypes.string.isRequired,
    shared: React.PropTypes.bool,
  },
  render: function() {
    var boxmaterial = lookupmaterial(this.props.materialname);
    return ReactTHREE.Mesh({name:this.props.name, position:this.props.position, geometry:boxgeometry, material:boxmaterial, shared:true, onPick:this.props.onPick});
  }
});

//
// A cube that, when clicked, removes itself from the application state
//

var ClickToRemoveCube = React.createClass({
  displayName: 'ClickToRemoveCube',
  removeThisCube: function(event, intersection) {
    var cubeid = intersection.object.name;
    removeCubeById(cubeid);
  },
  render: function() {
    var props = this.props;
    return ClickableCube({name:props.name, position:props.position, materialname:'lollipopGreen.png', onPick:this.removeThisCube});
  }
});


//
// Component that represents an add button. click on this 'button' (really a cube) to add a cube to the scene
//

var CubeAppButtons = React.createClass({
  displayName:'CubeAppButtons',
  propTypes: {
  },
  handlePick: function(/*event, intersection*/) {
    addRandomCube();
  },
  render: function() {
    return ReactTHREE.Object3D(
      {},
      ClickableCube({position: new THREE.Vector3(0,0,0), materialname:'cherry.png', name:'addbutton', onPick:this.handlePick})
    );
  }
});

//
// Component to display all the dynamically added cubes. All we do is
// generate a ClickableCube component for each entry in the 'cubes' property.
//

var RemovableCubes = React.createClass({
  displayName:'RemoveableCubes',
  render: function() {
    var args = [{}];
    _.forEach(this.props.cubes, function(cube) { args.push(ClickToRemoveCube(cube));});
    return ReactTHREE.Object3D.apply(null,args);
  }
});

//
// The top level component
// props:
// - width,height : size of the overall render canvas in pixels
// - sprites: a list of objects describing all the current sprites containing x,y and image fields
//

var CubeApp = React.createClass({
  displayName: 'CubeApp',
  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
  },
  render: function() {
    return ReactTHREE.Scene(
      // stage props
      {width: this.props.width, height: this.props.height},
      // children components are the buttons and the dynamic sprites
      [
        RemovableCubes({key:'cubes', cubes:this.props.cubes}),
        CubeAppButtons({key:'gui'})
      ]
    );
  }
});



/* jshint unused:false */
function interactiveexamplestart() {

  var renderelement = document.getElementById("three-box");

  var w = window.innerWidth-6;
  var h = window.innerHeight-6;

  g_applicationstate = {width:w, height:h, cubes:[], xsize:500, ysize:500, zsize:500 };

  g_reactinstance = React.renderComponent(CubeApp(g_applicationstate), renderelement);
}


