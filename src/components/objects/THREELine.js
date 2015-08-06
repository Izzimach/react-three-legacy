var THREE = require('three');
var createTHREEComponent = require('../../Utils').createTHREEComponent;
var THREEObject3DMixin = require('../../mixins/THREEObject3DMixin');

var THREELine = createTHREEComponent(
    'Line',
    THREEObject3DMixin,
    {
        createTHREEObject: function() {
            return new THREE.Line(new THREE.Geometry());
        },

        applySpecificTHREEProps: function(oldProps, newProps) {
            this.transferTHREEObject3DPropsByName(oldProps,newProps,
                ['geometry','material','mode']);
        }
    }
);
module.exports = THREELine;