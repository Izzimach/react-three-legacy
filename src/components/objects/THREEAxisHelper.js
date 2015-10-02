var THREE = require('three');
var createTHREEComponent = require('../../Utils').createTHREEComponent;
var THREEObject3DMixin = require('../../mixins/THREEObject3DMixin');

var THREEAxisHelper = createTHREEComponent(
    'AxisHelper',
    THREEObject3DMixin,
    {
        createTHREEObject: function() {
            return new THREE.AxisHelper(this._currentElement.props.size || 5);
        }
    }
);
module.exports = THREEAxisHelper;