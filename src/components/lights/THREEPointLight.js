var THREE = require('three');
var createTHREEComponent = require('../../Utils').createTHREEComponent;
var THREEObject3DMixin = require('../../mixins/THREEObject3DMixin');
var LightObjectMixin = require('../../mixins/LightObjectMixin');

var THREEPointLight = createTHREEComponent(
    'PointLight',
    THREEObject3DMixin,
    {
        createTHREEObject: function() {
            return new THREE.PointLight(0xffffff, 1, 100);
        },

        applySpecificTHREEProps: function(oldProps, newProps) {
            LightObjectMixin.applySpecificTHREEProps.call(this, oldProps, newProps);

            this.transferTHREEObject3DPropsByName(oldProps, newProps, ['intensity','distance']);
        }
    }
);
module.exports = THREEPointLight;