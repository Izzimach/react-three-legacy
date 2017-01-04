// A simple SphericalPanorama viewer

/* global React */
/* global ReactTHREE */
/* global THREE */

var sphereGeometry = new THREE.SphereGeometry(100, 32, 32);

var imageMaterial =  new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture('/examples/assets/spherePanorama.jpg')
});

var SpherePanoramaScene = React.createClass({
    displayName: 'SpherePanoramaScene',
    render: function() {
        var sceneProps = {
            width: this.props.width,
            height: this.props.height,
            camera: 'maincamera',
            listenToClick: true
        };

        var cameraAngle = this.props.cameraAngle || 0;
        var cameraLookAt = new THREE.Vector3(
            Math.cos(cameraAngle),
            0,
            Math.sin(cameraAngle)
        );

        var mainCamera = React.createElement(
            ReactTHREE.PerspectiveCamera,
            {
                name: 'maincamera',
                aspect: this.props.width / this.props.height,
                near: 1,
                far: 5000,
                position: new THREE.Vector3(0, 0, 0),
                lookat: cameraLookAt
            }
        );

        var sphere = React.createElement(
            ReactTHREE.Mesh,
            {
                geometry: sphereGeometry,
                material: imageMaterial,
                position: new THREE.Vector3(0, 0, 0),
                scale: new THREE.Vector3(1, 1, -1),
                quaternion: new THREE.Quaternion()
            }
        );

        return React.createElement(
          ReactTHREE.Renderer,
          {width: this.props.width, height: this.props.height, background:0x202020},
          React.createElement(
            ReactTHREE.Scene,
            sceneProps,
            mainCamera,
            sphere
          )
        );
    }
});


function spherepanoramaexamplestart() { // eslint-disable-line no-unused-vars
    var renderelement = document.getElementById("three-box");
    var appState = {
        width: window.innerWidth,
        height: window.innerHeight,
        cameraAngle: 0
    };

    ReactTHREE.render(
        React.createElement(SpherePanoramaScene, appState),
        renderelement
    );

    var start = Date.now();
    var PERIOD = 30;

    function animate(time) {
        var dt = time - start;
        var newAngle = (2 * dt / (PERIOD * 1000)) * Math.PI;
        appState.cameraAngle = newAngle;

        ReactTHREE.render(
            React.createElement(SpherePanoramaScene, appState),
            renderelement
        );

      requestAnimationFrame(animate);
    }

    animate(start);
}
