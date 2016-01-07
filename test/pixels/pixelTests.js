//
// pixelTests(fixture) will render various
// React-THREE components, capture the rendered canvas pixels, and return
// the pixels as byte data.
//
/* jshint strict: false */
/* global React : false */
/* global ReactTHREE : false */
/* global _ : false */

function drawTestRenders(mountpoint, testimage) {
  var origin = new THREE.Vector3(0,0,0);
  var testgeometry = new THREE.BoxGeometry( 200,200,200);
  var testmaterial = new THREE.MeshBasicMaterial( { map: testimage } );

  var defaultcameraprops = {
    name:'maincamera',
    fov:'75',
    aspect: 1,
    near: 10,
    far: 700,
    position: new THREE.Vector3(0,0,600),
    lookat:origin
  };
  var imagesize = 400;

  var MeshTestComponent = React.createClass({
    displayName:'SpriteTextComponent',
    render: function () {
      var cameraprops = _.clone(defaultcameraprops);
      cameraprops.aspectratio = this.props.width/this.props.height;

      var rendererprops = { width : this.props.width, height : this.props.height, ref : 'renderer', background: 0xff00ff };
      var sceneprops = _.assign({ camera : 'maincamera', ref : 'scene' }, rendererprops);
      

      return React.createElement(ReactTHREE.Renderer,
                                 rendererprops, 
                                 React.createElement(ReactTHREE.Scene,
                                                     // props
                                                     sceneprops,
                                                     // children
                                                     React.createElement(ReactTHREE.Mesh, this.props.meshprops),
                                                     React.createElement(ReactTHREE.PerspectiveCamera, cameraprops)));
    }
  });
  var MeshTest = React.createFactory(MeshTestComponent);

  // now make multiple renders with slightly different mesh props. For each set of sprite props
  // we record a snapshot. These snapshots are compared with the known 'good' versions.

  var meshtestprops = [
    { position: origin, geometry:testgeometry, material:testmaterial},
    { position: new THREE.Vector3(100,0,0), geometry:testgeometry, material:testmaterial},
    { position: new THREE.Vector3(0,100,0), geometry:testgeometry, material:testmaterial},
    { position: new THREE.Vector3(0,0,100), geometry:testgeometry, material:testmaterial},
    { position: origin, quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(0,2.5,0)), geometry:testgeometry, material:testmaterial},
    { position: origin, quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,2.5)), geometry:testgeometry, material:testmaterial},
    { position: origin, scale:2, geometry:testgeometry, material:testmaterial},
  ];

  var renderresults = [];

  meshtestprops.forEach(function (curprops) {
    curprops.key = 'urgh'; // re-use the same sprite instance
    var reactinstance = ReactTHREE.render(MeshTest({width:imagesize, height:imagesize, meshprops:curprops}), mountpoint);

    // Convert the rendered image to a data blob we can use. We do this by
    // getting a data URL from the scene canvas
    var renderURL = ReactDOM.findDOMNode(reactinstance.refs['renderer']).toDataURL('image/png');

    renderresults.push(renderURL);
  });

  ReactTHREE.unmountComponentAtNode(mountpoint);

  return renderresults;
}

function pixelTests(fixture, testimagepath, resultscallback) {
  // preload the image so that we don't get a blank render
  console.log("Loading test image...");
  THREE.ImageUtils.loadTexture(testimagepath + 'testimage.png', THREE.UVMapping, function (testtexture) {
    var results = drawTestRenders(fixture, testtexture);
    resultscallback(results);
  }, function() { console.log("error loading test image");});

  return null;
}
