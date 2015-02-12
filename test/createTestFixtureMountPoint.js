
//
// ideally we would create a new canvas for each new test and destroy it when
// the test is over in order to keep each test clean. However, some browsers
// get a little grumpy if you create a lot of WebGL contexts. Typically they
// try to free up old contexts as you create new ones but sometimes you'll
// still end up with no context and a blank canvas.
//

//
// Instead, the tests here all share the same root DOM element and
// WebGL canvas. When browsers are a little better at handling this we
// can always add code later to properly tear down the WebGL context after
// each test
//

// the test fixture is a single div with the id 'test-fixture' and
// the BasicTestFixture is mounted on it. All tests work by
// adding sub-objects to the BasicTestFixture component. This way we
// avoid creating and destroying WebGL contexts, although you can
// still it do 'by hand' by unmounting the component
var BasicTestFixture = React.createClass({
  displayName: 'BasicTestFixture',
  render: function() {
    var sceneprops = {width:this.props.width, height:this.props.height, ref:'scene'};

    if (typeof this.props.subcomponentfactory === 'undefined' ||
        this.props.subcomponentfactory === null) {
      return React.createElement(ReactTHREE.Scene, sceneprops);
    } else {
      return React.createElement(ReactTHREE.Scene, sceneprops, this.props.subcomponentfactory(this.props.subcomponentprops));
    }
  }
});

var createTestFixture = React.createFactory(BasicTestFixture);

function createTestFixtureMountPoint() {
  var testDOMelement = window.document.getElementById('test-fixture');
  if (testDOMelement == null) {
    testDOMelement = window.document.createElement('div');
    testDOMelement.id = 'test-fixture';
    window.document.body.appendChild(testDOMelement);
  }

  return testDOMelement;
}

function removeTestFixtureMountPoint(mountpoint) {
  // someday in the glorious future we'll remove the dom element here
}
