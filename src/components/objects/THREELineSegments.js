var THREE = require('three');
var createTHREEComponent = require('../../Utils').createTHREEComponent;
var THREEObject3DMixin = require('../../mixins/THREEObject3DMixin');

var THREELineSegments = createTHREEComponent(
    'LineSegments',
    THREEObject3DMixin,
    {
        createTHREEObject: function() {
            return new THREE.LineSegments();
        },

        applySpecificTHREEProps: function(oldProps, newProps) {
            this.transferTHREEObject3DPropsByName(oldProps,newProps,
                ['geometry','material','mode']);
        }
    }
);
module.exports = THREELineSegments;
