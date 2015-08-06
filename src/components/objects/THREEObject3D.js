var createTHREEComponent = require('../../Utils').createTHREEComponent;
var THREEObject3DMixin = require('../../mixins/THREEObject3DMixin');

var THREEObject3D = createTHREEComponent(
    'Object3D',
    THREEObject3DMixin);

module.exports = THREEObject3D;