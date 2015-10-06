var THREE = require('three');
var createTHREEComponent = require('../../Utils').createTHREEComponent;
var THREEObject3DMixin = require('../../mixins/THREEObject3DMixin');

var THREEOrthographicCamera = createTHREEComponent(
    'OrthographicCamera',
    THREEObject3DMixin,
    {
        createTHREEObject: function() {
            return new THREE.OrthographicCamera();
        },

        applySpecificTHREEProps: function(oldProps, newProps) {
            this.transferTHREEObject3DPropsByName(oldProps, newProps,
                ['left','right','top','bottom','near','far']);

            this._THREEObject3D.updateProjectionMatrix();
        }
    }
);

module.exports = THREEOrthographicCamera;
