// for Mesh we perform some pixel-compare tests

describe("THREE Mesh Component", function() {

  // need to prepend 'base' to the path since that's how the karma webserver
  // routes static file serving
  var imagePath = 'base/test/pixels/';
  var pixelReferenceImage = function(index) {
    return [imagePath, 'testrender',index,'.png'].join('');
  };

  var mountpoint = null;

  beforeEach(function() { mountpoint = createTestFixtureMountPoint(); });
  afterEach(function() { removeTestFixtureMountPoint(mountpoint); });


  it("puts pixels on the canvas", function(done) {
    pixelTests(mountpoint, imagePath, function (results) {
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);

      var comparesperformed = 0;
      for (var compareindex=0; compareindex < results.length; compareindex++) {
        var refimageURI = pixelReferenceImage(compareindex);
        var testimageURI = results[compareindex];

        resemble(testimageURI)
        .compareTo(refimageURI)
        .onComplete(function (data) {
          expect(data).toBeDefined();
          expect(typeof data).toEqual('object');
          expect(data.isSameDimensions).toEqual(true);
          // we allow for a fairly big mismatch since we may be comparing
          // WebGL-rendered images to canvas-rendered images and vice-versa
          if (data.misMatchPercentage > 7) {
            console.log("mismatch is " + data.misMatchPercentage.toString());
            console.log("reference image URI is " + refimageURI);
            console.log("test image URI is " + testimageURI);
            console.log("mismatch image data URI is " + data.getImageDataUrl());
          }
          expect(data.misMatchPercentage).toBeLessThan(7);

          comparesperformed++;
          if (comparesperformed === results.length) {
            done();
          }
        });
      }

    });
  });
});
