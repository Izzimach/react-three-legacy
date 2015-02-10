describe("THREE Object3D Component", function() {
  var Object3DContainer = React.createFactory(ReactTHREE.Object3D);

  var mountpoint = null;

  beforeEach(function() { mountpoint = createTestFixtureMountPoint(); });
  afterEach(function() { removeTestFixtureMountPoint(mountpoint); });

  //
  // This component just renders an  Object3D which
  // has some specific number of objects as children.
  // you specify the number of children as props.childCount
  //
  var VariableChildrenComponent = React.createClass({
    displayName: 'variableChildrenComponent',
    render: function () {
      var o3dargs = [{key:'argh'}];
      for (var childindex=0; childindex < this.props.childCount; childindex++) {
        var somechild = Object3DContainer(
          {
            key:childindex,
            ref:'child' + childindex.toString(),
            position: new THREE.Vector3(childindex,0,0)
          }
        );
        o3dargs.push(somechild);
      }

      return Object3DContainer.apply(null, o3dargs);
    }
  });

  function VariableChildrenTest(numchildren) {
    return createTestFixture({
      width:300,
      height:300,
      subcomponentfactory: React.createFactory(VariableChildrenComponent),
      subcomponentprops:{childCount:numchildren}
    });
  };

  var maxtestchildren = 10;

  it("maintains proper references to the parent Object3D", function() {
    var reactinstance = React.render(VariableChildrenTest(1),mountpoint);

    var scene = reactinstance.refs['scene']._THREEObject3D;
    var testpoint = scene.children[0];

    expect(testpoint.parent).toBe(scene);
  });

  it("can hold a variable number of children", function() {

    for (var numchildren = 0; numchildren < maxtestchildren; numchildren++) {
      var reactinstance = React.render(
        VariableChildrenTest(numchildren),
        mountpoint);

      expect(mountpoint.childNodes.length).toBe(1);
      expect(mountpoint.childNodes[0].nodeName).toBe('CANVAS');

      // the tree from here on down is three.js objects, not DOM nodes!
      expect(mountpoint.childNodes[0].childNodes.length).toBe(0);

      // examine the three.js objects
      var scene = reactinstance.refs['scene']._THREEObject3D;
      var testpoint = scene.children[0];

      expect(scene.children.length).toBe(1);
      expect(testpoint.children.length).toBe(numchildren);

      // make sure they're in the right order by examing the x-coordinate of
      // each child object
      for (var testindex=0; testindex < numchildren; testindex++) {
        expect(testpoint.children[testindex].position.x).toBeCloseTo(testindex,2);
      }
    }
  });

  it ("can add Object3D node to an already-mounted tree", function() {
    var reactinstance = React.render(
      VariableChildrenTest(0),
      mountpoint);

    for (var numchildren = 1; numchildren < maxtestchildren; numchildren++) {

      // this should add another Object3D as a child
      reactinstance = React.render(
        VariableChildrenTest(numchildren),
        mountpoint);

      expect(mountpoint.childNodes.length).toBe(1);
      expect(mountpoint.childNodes[0].nodeName).toBe('CANVAS');

      // the tree from here on down is three.js objects, not DOM nodes
      expect(mountpoint.childNodes[0].childNodes.length).toBe(0);

      // examine the three.js objects
      var scene = reactinstance.refs['scene']._THREEObject3D;
      var testpoint = scene.children[0];

      expect(scene.children.length).toBe(1);
      expect(testpoint.children.length).toBe(numchildren);

      // here we don't unmount, so that the next time through React has to
      // add children instead of building them from scratch
    }
  });

  it("can remove Object3D nodes from an already-mounted tree", function() {
    var reactinstance = React.render(
      VariableChildrenTest(maxtestchildren),
      mountpoint);

    for (var numchildren = maxtestchildren-1; numchildren > 0; numchildren--) {

      // this should remove an already existing child
      var reactinstance = React.render(
        VariableChildrenTest(numchildren),
        mountpoint);

      expect(mountpoint.childNodes.length).toBe(1);
      expect(mountpoint.childNodes[0].nodeName).toBe('CANVAS');

      // the tree from here on down is pixi objects, no DOM nodes
      expect(mountpoint.childNodes[0].childNodes.length).toBe(0);

      // examine the pixi objects
      var scene = reactinstance.refs['scene']._THREEObject3D;
      var testpoint = scene.children[0];

      expect(scene.children.length).toBe(1);
      expect(testpoint.children.length).toBe(numchildren);
    }
  });

  //
  // not implemented yet, so the following test is ignored
  //
  xit("correctly replaces THREE objects instead of setting HTML markup when replacing components in-place", function() {
    var Object3DFactory = React.createFactory(ReactTHREE.Object3D);
    var SceneFactory = React.createFactory(ReactTHREE.Scene);

    //
    // This occurs when a composite element is updated in-place. To create this (admittedly uncommon)
    // situation we create a composite component that changes the key of its child while everything else
    // (including the key of the composite element) remains unchanged.  In this case _updateChildren in ReactMultiChildMixin
    // will update in-place and then updateComponent in ReactCompositeComponentMixin will try to nuke and replace the child
    // component since the keys don't match.
    //
    var injectedKeyComponent = React.createClass({
      displayName: 'injectedKeyComponent',
      render: function () {
        var propswithkey = _.clone(this.props);
        propswithkey.key = this.props.injectedkey;
        return Object3DFactory(propswithkey);
      }
    });
    var injectedKeyFactory = React.createFactory(injectedKeyComponent);

    var injectedKeyScene = React.createClass({
      displayName: 'injectedKeyScene',
      render: function () {
        return SceneFactory({width:this.props.width, height:this.props.height, ref:'stage'},
                               injectedKeyFactory({x:100, y:100, key: 'argh', injectedkey:this.props.injectedkey}));
      }
    });
    var injectedKeySceneFactory = React.createFactory(injectedKeyScene);

    // generate two sets of props, identical except that they contain different
    // values of injectedkey.

    var baseprops = {width:300, height:300, key:'argh'};
    var addinjectedkey = function(originalprops, injectedkey) {
      var newprops = _.clone(originalprops);
      newprops.injectedkey = injectedkey;
      return newprops;
    };
    var props1 = addinjectedkey(baseprops, 'one');
    var props2 = addinjectedkey(baseprops, 'two');

    //
    // render with the original set of props, then again with a new injected key.
    // this should keep the same injectedKeyComponent instance but force React to
    // replace the Object3D inside of injectedKeyComponent. Note that the injectedkey
    // has to change to make this happens. If we don't switch the injected key
    //  then React will just update the current instance
    // of Object3D instead of replacing it.
    //
    var reactinstance = React.render(injectedKeyStageFactory(props1),mountpoint);

    // this should destroy and replace the child instance instead of updating it
    reactinstance.setProps(props2);

    expect(mountpoint.childNodes.length).toBe(1);
    expect(mountpoint.childNodes[0].nodeName).toBe('CANVAS');

    // the tree from here on down is three.js objects, not DOM nodes
    expect(mountpoint.childNodes[0].childNodes.length).toBe(0);

    // examine the three.js objects
    var scene = reactinstance.refs['scene']._THREEObject3D;
    expect(scene.children.length).toBe(1);
  })
});
