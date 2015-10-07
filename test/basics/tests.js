
describe("React and ReactTHREE modules", function() {

  // make sure we're running jasmine 2.0 by using the new
  // versions of the async functions
  it("are tested using Jasmine 2.0", function(done) {
    done();
  });

  it("exist and are loaded", function() {
    expect(React).toBeDefined();
    expect(ReactTHREE).toBeDefined();
    expect(THREE).toBeDefined();
  });

  it("has all the components you expect", function() {
    expect(ReactTHREE.Scene).toBeDefined();
    expect(ReactTHREE.PerspectiveCamera).toBeDefined();
    expect(ReactTHREE.OrthographicCamera).toBeDefined();
    expect(ReactTHREE.Object3D).toBeDefined();
    expect(ReactTHREE.Line).toBeDefined();
    expect(ReactTHREE.PointCloud).toBeDefined();
    expect(ReactTHREE.Mesh).toBeDefined();
    expect(ReactTHREE.SkinnedMesh).toBeDefined();
    expect(ReactTHREE.Sprite).toBeDefined();
    expect(ReactTHREE.AmbientLight).toBeDefined();
    expect(ReactTHREE.PointLight).toBeDefined();
    expect(ReactTHREE.AreaLight).toBeDefined();
    expect(ReactTHREE.DirectionalLight).toBeDefined();
    expect(ReactTHREE.HemisphereLight).toBeDefined();
    expect(ReactTHREE.SpotLight).toBeDefined();
    expect(ReactTHREE.render).toBeDefined();
  });
});
