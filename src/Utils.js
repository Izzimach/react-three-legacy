var assign = require('react/lib/Object.assign');

var Utils = {

    createTHREEComponent: function(name /* plus mixins */) {
        var ReactTHREEComponent = function(props) {
            /* jshint unused: vars */
            this.node = null;
            this._mountImage = null;
            this._renderedChildren = null;
            this._THREEObject3D = null;
        };
        ReactTHREEComponent.displayName = name;
        for (var i = 1; i < arguments.length; i++) {
            assign(ReactTHREEComponent.prototype, arguments[i]);
        }

        return ReactTHREEComponent;
    },

    // function to set a light color. The sourcevalue
    // can be either a number (usually in hex: 0xff0000)
    // or a THREE.Color
    setNewLightColor: function(targetColor, sourceValue) {
        // is the prop a hex number or a THREE.Color?
        if (typeof sourceValue === 'number') {
            targetColor.setHex(sourceValue);
        } else if (typeof sourceValue === 'object' &&
            sourceValue !== null &&
            sourceValue instanceof THREE.Color) {
            targetColor.copy(sourceValue);
        } else {
            warning(false, "Light color must be a number or an instance of THREE.Color");
        }
    }

};

module.exports = Utils;