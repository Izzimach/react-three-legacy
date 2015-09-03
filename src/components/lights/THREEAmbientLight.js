var THREE = require('three');
var createTHREEComponent = require('../../Utils').createTHREEComponent;
var THREEObject3DMixin = require('../../mixins/THREEObject3DMixin');
var LightObjectMixin = require('../../mixins/LightObjectMixin');

var THREEAmbientLight = createTHREEComponent(
    'AmbientLight',
    THREEObject3DMixin,
    {
        createTHREEObject: function() {
            return new THREE.AmbientLight(0x000000);
        },

        applySpecificTHREEProps: function (oldProps, newProps) {
            LightObjectMixin.applySpecificTHREEProps.call(this, oldProps, newProps);
        }
    }
);

module.exports = THREEAmbientLight;