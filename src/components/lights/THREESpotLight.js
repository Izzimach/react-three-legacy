var THREE = require('three');
var createTHREEComponent = require('../../Utils').createTHREEComponent;
var THREEObject3DMixin = require('../../mixins/THREEObject3DMixin');
var LightObjectMixin = require('../../mixins/LightObjectMixin');

var CommonShadowmapProps = require('./CommonShadowmapProps');

var THREESpotLight = createTHREEComponent(
    'SpotLight',
    THREEObject3DMixin,
    {
        createTHREEObject: function() {
            return new THREE.SpotLight(0xffffff, 1);
        },

        applySpecificTHREEProps: function(oldProps, newProps) {
            LightObjectMixin.applySpecificTHREEProps.call(this, oldProps, newProps);

            this.transferTHREEObject3DPropsByName(oldProps, newProps, CommonShadowmapProps);
            this.transferTHREEObject3DPropsByName(oldProps, newProps,
                ['target',
                    'intensity',
                    'distance',
                    'angle',
                    'exponent',
                    'castShadow',
                    'onlyShadow',
                    'shadowCameraFov']);
        }
    }
);

module.exports = THREESpotLight;