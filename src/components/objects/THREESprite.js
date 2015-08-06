var THREE = require('three');
var createTHREEComponent = require('../../Utils').createTHREEComponent;
var THREEObject3DMixin = require('../../mixins/THREEObject3DMixin');

var THREESprite = createTHREEComponent(
    'Sprite',
    THREEObject3DMixin,
    {
        createTHREEObject: function() {
            return new THREE.Sprite();
        },

        applySpecificTHREEProps: function(oldProps, newProps) {
            this.transferTHREEObject3DPropsByName(oldProps, newProps,
                ['material']);
        }
    }
);
module.exports = THREESprite;
