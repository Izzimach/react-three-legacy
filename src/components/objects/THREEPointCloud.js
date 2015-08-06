var THREE = require('three');
var createTHREEComponent = require('../../Utils').createTHREEComponent;
var THREEObject3DMixin = require('../../mixins/THREEObject3DMixin');

var THREEPointCloud = createTHREEComponent(
    'PointCloud',
    THREEObject3DMixin,
    {
        createTHREEObject: function() {
            return new THREE.PointCloud(new THREE.Geometry());
        },

        applySpecificTHREEProps: function(oldProps, newProps) {
            this.transferTHREEObject3DPropsByName(oldProps, newProps,
                ['geometry','material','frustumCulled','sortParticles']);
        }
    }

);

module.exports = THREEPointCloud;