var THREE = require('three');
var createTHREEComponent = require('../../Utils').createTHREEComponent;
var THREEObject3DMixin = require('../../mixins/THREEObject3DMixin');
var LightObjectMixin = require('../../mixins/LightObjectMixin');

var THREEAreaLight = createTHREEComponent(
    'AreaLight',
    THREEObject3DMixin,
    {
        createTHREEObject: function() {
            return new THREE.AreaLight(0xffffff, 1);
        },

        applySpecificTHREEProps: function(oldProps, newProps) {
            LightObjectMixin.applySpecificTHREEProps.call(this, oldProps, newProps);

            this.transferTHREEObject3DPropsByName(oldProps, newProps,
                ['right',
                    'normal',
                    'height',
                    'width',
                    'intensity',
                    'constantAttenuation',
                    'linearAttenuation',
                    'quadraticAttenuation']);
        }
    }
);

module.exports = THREEAreaLight;