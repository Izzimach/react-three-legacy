import ReactMultiChild from 'react-dom/lib/ReactMultiChild';
import assign from 'object-assign';

//
// Generates a React component by combining several mixin components
//

var THREEContainerMixin = assign({},  ReactMultiChild.Mixin, {
  moveChild: function(prevChild, lastPlacedNode, nextIndex, lastIndex) { // eslint-disable-line no-unused-vars
    // no-op for the renderer
    if (typeof this.renderScene !== 'undefined') { return; }
    
    let prevChildTHREEObject3D = prevChild._mountImage; // should be a three.js Object3D
    //let prevChildTHREEObject3D = prevChild.getNativeNode();
    let THREEObject3D = this._mountImage || this._THREEObject3D;
    //let THREEObject3D = this.getNativeNode();

    var prevChildIndex = THREEObject3D.children.indexOf(prevChildTHREEObject3D);
    if (prevChildIndex !== -1) {
      THREEObject3D.children.splice(prevChildIndex,1);
    }

    // remove from old location, put in the new location
    THREEObject3D.children.splice(nextIndex,0,prevChildTHREEObject3D);
  },

  createChild: function(child, afterNode, childTHREEObject3D) {
    child._mountImage = childTHREEObject3D;
    this._THREEObject3D.add(childTHREEObject3D);
  },

  removeChild: function(child, node) { // eslint-disable-line no-unused-vars
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

export default THREEContainerMixin;
