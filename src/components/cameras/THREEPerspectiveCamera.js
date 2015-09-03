var THREE = require('three');
var createTHREEComponent = require('../../Utils').createTHREEComponent;
var THREEObject3DMixin = require('../../mixins/THREEObject3DMixin');

var THREEPerspectiveCamera = createTHREEComponent(
    'PerspectiveCamera',
    THREEObject3DMixin,
    {
        createTHREEObject: function() {
            return new THREE.PerspectiveCamera();
        },

        applySpecificTHREEProps: function(oldProps, newProps) {
            this.transferTHREEObject3DPropsByName(oldProps, newProps,
                ['fov','aspect','near','far']);

            this._THREEObject3D.updateProjectionMatrix();
        }
    });

module.exports = THREEPerspectiveCamera;