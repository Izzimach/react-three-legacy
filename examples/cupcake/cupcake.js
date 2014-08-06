//
// Basic React-THREE example using a custom 'Cupcake' Component which consists of two cubes
//

/* jshint strict: false */
/* global React : false */
/* global ReactTHREE : false */

var assetpath = function(filename) { return '../assets/' + filename; };

//
// Cupcake component is two cube meshes textured with cupcake textures
//

var boxgeometry = new THREE.BoxGeometry( 200,200,200);

var cupcaketexture = THREE.ImageUtils.loadTexture( assetpath('cupCake.png') );
var cupcakematerial = new THREE.MeshBasicMaterial( { map: cupcaketexture } );

var creamtexture = THREE.ImageUtils.loadTexture( assetpath('creamPink.png') );
var creammaterial = new THREE.MeshBasicMaterial( { map: creamtexture } );

var Cupcake = React.createClass({
  displayName: 'Cupcake',
  render: function() {
    return ReactTHREE.Object3D(
      {rotation:this.props.rotation, position:new THREE.Vector3(0,0,0)},
      ReactTHREE.Mesh({position:new THREE.Vector3(0,-100,0), geometry:boxgeometry, material:cupcakematerial}),
      ReactTHREE.Mesh({position:new THREE.Vector3(0, 100,0), geometry:boxgeometry, material:creammaterial})
    );
  }
});

//
// The top level component
// props:
// - width,height : size of the overall render canvas in pixels
// - xposition: x position in pixels that governs where the elements are placed
//

var ExampleScene = React.createClass({
  displayName: 'ExampleScene',
  render: function() {
    return ReactTHREE.Scene(
      {width:this.props.width, height:this.props.height},
      Cupcake(this.props.cupcakedata)
    );
  }
});

/* jshint unused:false */
function cupcakestart() {
  var renderelement = document.getElementById("three-box");

  var w = window.innerWidth-6;
  var h = window.innerHeight-6;

  var sceneprops = {width:w, height:h, cupcakedata:{rotation:new THREE.Vector3(0,0,0)}};
  var cupcakeprops = sceneprops.cupcakedata;
  var rotationangle = 0;

  var reactinstance = React.renderComponent(ExampleScene(sceneprops), renderelement);

  function spincupcake(t) {
    rotationangle = t * 0.001;
    cupcakeprops.rotation.y = rotationangle;
    cupcakeprops.rotation.x = rotationangle * 0.3;
    reactinstance.setProps(sceneprops);

    requestAnimationFrame(spincupcake);
  }

  spincupcake();
}

