//
// code to generate test render images
// run this in slimerjs from the root directory:
// 'slimerjs test/pixels/generatetestrender.js'
//

var webPage = require('webpage');
var fs = require('fs');

var page = webPage.create();

page.viewportSize = {width:400,height:400};

page.onConsoleMessage = function(msg) {
  console.log('Web page log message: ' + msg);
};

//
// the pixelTests function renders the test images, converts them to binary data,
// and then calls the phantomjs callback with the data
//

page.onCallback = function(refimages) {

  for (var renderindex=0; renderindex < refimages.length; renderindex++) {
    var filename = 'test/pixels/testrender' + renderindex.toString() + '.png';

    fs.write(filename,refimages[renderindex], 'wb');
    console.log('Wrote test render file ' + filename);
  }
  slimer.exit();
}

page.open('test/pixels/generatetestrender.html', function() {

  // invoke pixelTests to render images and return them via the phantomjs callback
  var fixture = page.evaluateAsync(function() {

    // shim out requestAnimationFrame as a no-op
    window.requestAnimationFrame = window.requestAnimationFrame || function() {};

    // this code executes in the webpage context!
    var fixture = document.getElementById('test-fixture');
    console.log("Got test fixture");
    var renderresults = pixelTests(fixture, './', function(results) {
      console.log('Got reference images');

      // pixelTests() generates base64 encoded images, so convert them to raw
      // binary PNGs before returning them

      var binaryresults = [];
      results.forEach(function(refimage) {
        // split into two parts; the base64 header and the actual data.  we just want the data
        var renderURLbits = refimage.split(',');
        binaryresults.push(window.atob(renderURLbits[1]));
      });
      window.callPhantom(binaryresults);
    });

    return renderresults;
  });
});
