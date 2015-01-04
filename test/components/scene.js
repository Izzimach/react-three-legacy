

describe("THREE Scene Component", function() {
  var scenecomponent = createTestFixture({width:300, height:300});
  var mountpoint = null;

  beforeEach(function() { mountpoint = createTestFixtureMountPoint(); });
  afterEach(function() { removeTestFixtureMountPoint(mountpoint); });

  it("creates a canvas used by THREE", function() {
    React.render(scenecomponent,mountpoint);

    expect(mountpoint.childNodes.length).toBe(1);
    expect(mountpoint.childNodes[0].nodeName).toBe('CANVAS');
    expect(mountpoint.childNodes[0].childNodes.length).toBe(0);
  });

  it("creates a THREE Scene object", function() {
    var reactinstance = React.render(scenecomponent,mountpoint);

    // hm, probably need some equivalent of getDOMNode
    expect(reactinstance.refs['scene']._THREEObject3D).toBeDefined();
    expect(reactinstance.refs['scene']._THREErenderer).toBeDefined();
    expect(reactinstance.refs['scene']._THREEObject3D instanceof THREE.Scene).toBe(true);
  });

  it("destroys the canvas when the stage is unmounted", function() {
    reactinstance = React.render(scenecomponent,mountpoint);

    // this should unmount the stage and remove the canvas
    var reactinstance = React.render(React.DOM.div(), mountpoint);

    expect(mountpoint.childNodes.length).toBe(1);
    expect(mountpoint.childNodes[0].nodeName).not.toBe('CANVAS');
    expect(mountpoint.childNodes[0].childNodes.length).toBe(0);

    React.unmountComponentAtNode(mountpoint);

    expect(mountpoint.childNodes.length).toBe(0);
  });
});
