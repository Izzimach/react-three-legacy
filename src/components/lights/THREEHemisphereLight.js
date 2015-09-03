var THREE = require('three');
var createTHREEComponent = require('../../Utils').createTHREEComponent;
var THREEObject3DMixin = require('../../mixins/THREEObject3DMixin');
var LightObjectMixin = require('../../mixins/LightObjectMixin');

var THREEHemisphereLight = createTHREEComponent(
    'HemisphereLight',
    THREEObject3DMixin,
    {
        createTHREEObject: function() {
            return new THREE.HemisphereLight(0x8888ff, 0x000000, 1);
        },

        applySpecificTHREEProps: function(oldProps, newProps) {
            LightObjectMixin.applySpecificTHREEProps.call(this, oldProps, newProps);

            // sky color gets mapped to 'color'
            if (typeof newProps.skyColor !== 'undefined') {
                setNewLightColor(this._THREEObject3D.color, newProps.skyColor);
            }

            this.transferTHREEObject3DPropsByName(oldProps, newProps,
                ['groundColor',
                    'intensity']);
        }
    }
);

module.exports = THREEHemisphereLight;