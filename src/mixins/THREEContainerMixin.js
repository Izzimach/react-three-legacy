var ReactMultiChild = require('react/lib/ReactMultiChild');
var emptyObject = require('fbjs/lib/emptyObject');
var assign = require('react/lib/Object.assign');

//
// Generates a React component by combining several mixin components
//

var THREEContainerMixin = assign({},  ReactMultiChild.Mixin, {
    moveChild: function(child, toIndex) {
        var childTHREEObject3D = child._mountImage; // should be a three.js Object3D
        var THREEObject3D = this._THREEObject3D;

        if (!THREEObject3D) return; // for THREERenderer, which has no _THREEObject3D

        var childindex = THREEObject3D.children.indexOf(childTHREEObject3D);
        if (childindex === -1) {
            throw new Error('The object to move needs to already be a child');
        }

        // remove from old location, put in the new location
        THREEObject3D.children.splice(childindex,1);
        THREEObject3D.children.splice(toIndex,0,childTHREEObject3D);
    },

    createChild: function(child, childTHREEObject3D) {
        child._mountImage = childTHREEObject3D;
        this._THREEObject3D.add(childTHREEObject3D);
    },

    removeChild: function(child) {
        var childTHREEObject3D = child._mountImage;

        this._THREEObject3D.remove(childTHREEObject3D);
        child._mountImage = null;
    },

    /**
     * Override to bypass batch updating because it is not necessary.
     *
     * @param {?object} nextChildren.
     * @param {ReactReconcileTransaction} transaction
     * @internal
     * @override {ReactMultiChild.Mixin.updateChildren}
     */
    updateChildren: function(nextChildren, transaction, context) {
        this._updateChildren(nextChildren, transaction, context);
    },

    // called by any container component after it gets mounted
    mountAndAddChildren: function(children, transaction, context) {
        var mountedImages = this.mountChildren(
            children,
            transaction,
            context
        );
        // Each mount image corresponds to one of the flattened children
        const thisTHREEObject3D = this._THREEObject3D;
        var i = 0;
        for (var key in this._renderedChildren) {
            if (this._renderedChildren.hasOwnProperty(key)) {
                var child = this._renderedChildren[key];
                child._mountImage = mountedImages[i];

                // THREERenderer has no _THREEObject3D
                if (thisTHREEObject3D) thisTHREEObject3D.add(child._mountImage);
                i++;
            }
        }
    }
});

module.exports = THREEContainerMixin;
