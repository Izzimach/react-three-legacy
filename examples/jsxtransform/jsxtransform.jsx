//
// The cupcake example done using JSX instead of javascript.
//

var assetpath = function(filename) { return '../assets/' + filename; };
var boxgeometry = new THREE.BoxGeometry( 200,200,200);

//
// Supposedly you can skip these declares and just write jsx elements like
// <ReactTHREE.Scene ...> but I haven't actually tried that
//

var Renderer = ReactTHREE.Renderer;
var Scene = ReactTHREE.Scene;
var Mesh = ReactTHREE.Mesh;
var Object3D = ReactTHREE.Object3D;
var PerspectiveCamera = ReactTHREE.PerspectiveCamera;

//
// Cupcake component is two cube meshes textured with cupcake textures
//

var cupcaketexture = THREE.ImageUtils.loadTexture( assetpath('cupCake.png') );
var cupcakematerial = new THREE.MeshBasicMaterial( { map: cupcaketexture } );

var creamtexture = THREE.ImageUtils.loadTexture( assetpath('creamPink.png') );
var creammaterial = new THREE.MeshBasicMaterial( { map: creamtexture } );

var Cupcake = React.createClass({
  displayName: 'Cupcake',
  propTypes: {
    position: React.PropTypes.instanceOf(THREE.Vector3),
    quaternion: React.PropTypes.instanceOf(THREE.Quaternion).isRequired
  },
  render: function() {
    return  <Object3D quaternion={this.props.quaternion} position={this.props.position || new THREE.Vector3(0,0,0)}>
              <Mesh position={new THREE.Vector3(0,-100,0)} geometry={boxgeometry} material={cupcakematerial} />
              <Mesh position={new THREE.Vector3(0,100,0)}  geometry={boxgeometry} material={creammaterial} />
            </Object3D>;
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
    var aspectratio = this.props.width / this.props.height;
    var cameraprops = {fov:75, aspect:aspectratio, near:1, far:5000, position:new THREE.Vector3(0,0,600), lookat:new THREE.Vector3(0,0,0)};

    return <Renderer width={this.props.width} height={this.props.height}>
        <Scene width={this.props.width} height={this.props.height} camera="maincamera">
            <PerspectiveCamera name="maincamera" {...cameraprops} />
            <Cupcake {...this.props.cupcakedata} />
        </Scene>
    </Renderer>;
  }
});


function jsxtransformstart() { // eslint-disable-line no-unused-vars
  var renderelement = document.getElementById("three-box");

  var w = window.innerWidth-6;
  var h = window.innerHeight-6;

  var sceneprops = {width:w, height:h, cupcakedata:{position:new THREE.Vector3(0,0,0), quaternion:new THREE.Quaternion()}};
  var cupcakeprops = sceneprops.cupcakedata;
  var rotationangle = 0;

  ReactTHREE.render(<ExampleScene {...sceneprops}/>, renderelement);

  function spincupcake(t) {
    rotationangle = t * 0.001;
    cupcakeprops.quaternion.setFromEuler(new THREE.Euler(rotationangle,rotationangle*3,0));
    cupcakeprops.position.x = 300  * Math.sin(rotationangle);
    ReactTHREE.render(<ExampleScene {...sceneprops}/>, renderelement);

    requestAnimationFrame(spincupcake);
  }

  spincupcake();
}

window.onload = jsxtransformstart;
