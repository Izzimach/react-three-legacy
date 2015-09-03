var THREE = require('three');
var createTHREEComponent = require('../../Utils').createTHREEComponent;
var THREEObject3DMixin = require('../../mixins/THREEObject3DMixin');

var THREESkinnedMesh = createTHREEComponent(
    'SkinnedMesh',
    THREEObject3DMixin,
    {
        // skinned mesh is special since it needs the geometry and material data upon construction
        /* jshint unused: vars */
        mountComponent: function(rootID, transaction, context) {
            this._THREEObject3D = new THREE.SkinnedMesh(this._currentElement.props.geometry, this._currentElement.props.material);
            this.applyTHREEObject3DProps({}, this._currentElement.props);
            this.applySpecificTHREEProps({}, this._currentElement.props);

            this.mountAndAddChildren(this._currentElement.props.children, transaction, context);
            return this._THREEObject3D;
        },
        /* jshint unused: true */

        applySpecificTHREEProps: function(/*oldProps, newProps*/) {
        }
    }
);

module.exports = THREESkinnedMesh;
