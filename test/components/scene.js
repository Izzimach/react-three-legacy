

describe("THREE Scene Component", function() {
  var scenecomponent = createTestFixture({width:300, height:300});
  var mountpoint = null;

  beforeEach(function() { mountpoint = createTestFixtureMountPoint(); });
  afterEach(function() { removeTestFixtureMountPoint(mountpoint); });

  it("creates a canvas used by THREE", function() {
    ReactTHREE.render(scenecomponent,mountpoint);

    expect(mountpoint.childNodes.length).toBe(1);
    expect(mountpoint.childNodes[0].nodeName).toBe('CANVAS');
    expect(mountpoint.childNodes[0].childNodes.length).toBe(0);
  });

  it("creates a THREE Scene object", function() {
    var reactinstance = ReactTHREE.render(scenecomponent,mountpoint);

    // hm, probably need some equivalent of getDOMNode
    expect(reactinstance.refs.scene).toBeDefined();
    expect(reactinstance.refs.scene).toBeDefined();
    expect(reactinstance.refs.scene instanceof THREE.Scene).toBe(true);
  });

  it("destroys the canvas when the stage is unmounted", function() {
    reactinstance = ReactTHREE.render(scenecomponent,mountpoint);

    // this should unmount the stage and remove the canvas
    var reactinstance = ReactTHREE.render(React.DOM.div(), mountpoint);

    expect(mountpoint.childNodes.length).toBe(1);
    expect(mountpoint.childNodes[0].nodeName).not.toBe('CANVAS');
    expect(mountpoint.childNodes[0].childNodes.length).toBe(0);

    ReactTHREE.unmountComponentAtNode(mountpoint);

    expect(mountpoint.childNodes.length).toBe(0);
  });

  it("passes the context down into threejs elements", function() {

    // this component is an object that uses the x/y/z from the context to position the object
    var Object3DFromContext = React.createClass({
      displayName:'Object3D_PositionFromContext',
      contextTypes: {
	position_context: React.PropTypes.any
      },
      render: function() {
	console.log(this.context);
	return React.createElement(
	  ReactTHREE.Object3D,
	  {position: this.context.position_context}
	);
      }
    });
    
    // this component creates a context that contains the desired position
    var TestFixtureWithContext = React.createClass({
      displayName:'TestFixtureWithContext',
      childContextTypes: {
	position_context: React.PropTypes.any
      },
      getChildContext: function() {
	return {
	  position_context: new THREE.Vector3(
	    this.props.mesh_x,
	    this.props.mesh_y,
	    this.props.mesh_z
	  )
	};
      },
      render: function() {
        var rendererprops = {width:this.props.width, height:this.props.height};
	var sceneprops = {width:this.props.width, height:this.props.height, ref:'scene'};

	// note that object3d  x/y/z are not passed down in the props, but must
	// be obtained from the context
	return React.createElement(ReactTHREE.Renderer,
                                   rendererprops,
                                   React.createElement(ReactTHREE.Scene,
				                       sceneprops,
				                       React.createElement(Object3DFromContext)));
      }
    });
						   
    var contextcomponent = React.createElement(
      TestFixtureWithContext,
      {
	width: 300,
	height: 300,
	mesh_x: 51,
	mesh_y: 52,
	mesh_z: 53
      });

    var reactinstance = ReactTHREE.render(contextcomponent, mountpoint);

    // if the context was passed in the sprite x/y should have been
    // determined by the x/y values in the context
    var scene = reactinstance.refs.scene;
    expect(scene.children[0].position.x).toBe(51);
    expect(scene.children[0].position.y).toBe(52);
    expect(scene.children[0].position.z).toBe(53);

  });

});
