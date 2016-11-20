//
// time to monkey-patch React!
//
// a subtle bug happens when ReactCompositeComponent updates something in-place by
// modifying HTML markup; since THREE objects don't exist as markup the whole thing bombs.
// we try to fix this by monkey-patching ReactCompositeComponent
//

"use strict";

import ReactCompositeComponent from 'react-dom/lib/ReactCompositeComponent';
import ReactReconciler from 'react-dom/lib/ReactReconciler';

import shouldUpdateReactComponent from 'react-dom/lib/shouldUpdateReactComponent';
import warning from 'fbjs/lib/warning';

//
// Composite components don't have an Object3D. So we have to do some work to find
// the proper Object3D sometimes.
//


function findObject3DChild(componentinstance) {
  // walk downwards via _renderedComponent to find something with a displayObject
  var componentwalker = componentinstance;
  while (typeof componentwalker !== 'undefined') {
    // no displayObject? then fail
    if (typeof componentwalker._THREEObject3D !== 'undefined') {
      return componentwalker._THREEObject3D;
    }
    componentwalker = componentwalker._renderedComponent;
  }

  // we walked all the way down and found no Object3D
  return undefined;

}

//
// This modified version of updateRenderedComponent will
// manage Object3D nodes instead of HTML markup
//
var old_updateRenderedComponent = ReactCompositeComponent._updateRenderedComponent;

var ReactTHREE_updateRenderedComponent = function(transaction, context) {
  var prevComponentInstance = this._renderedComponent;
  
  // Find the first actual rendered (non-Composite) component.
  // If that component is a THREE node we use the special code here.
  // If not, we call back to the original version of updateComponent
  // which should handle all non-THREE nodes.
  
  var prevObject3D = findObject3DChild(prevComponentInstance);
  if (!prevObject3D) {
    // not a THREE node, use the original DOM-style version
    old_updateRenderedComponent.call(this,transaction, context);
    return;
  }
  
  // This is a THREE node, do a special THREE version of updateComponent
  var prevRenderedElement = prevComponentInstance._currentElement;
  var nextRenderedElement = this._renderValidatedComponent();
  
  if (shouldUpdateReactComponent(prevRenderedElement, nextRenderedElement)) {
    ReactReconciler.receiveComponent(
      prevComponentInstance,
      nextRenderedElement,
      transaction,
      this._processChildContext(context)
    );
  } else {
    // We can't just update the current component.
    // So we nuke the current instantiated component and put a new component in
    // the same place based on the new props.
    var thisID = this._rootNodeID;
    
    var object3DParent = prevObject3D.parent;
    
    // unmounting doesn't disconnect the child from the parent node,
    // but later on we'll simply overwrite the proper element in the 'children' data member
    var object3DIndex = object3DParent.children.indexOf(prevObject3D);
    ReactReconciler.unmountComponent(prevComponentInstance);
    
    // create the new object and stuff it into the place vacated by the old object
    this._renderedComponent = this._instantiateReactComponent(
      nextRenderedElement,
      this._currentElement.type);
    var nextObject3D = ReactReconciler.mountComponent(
      this._renderedComponent,
      thisID,
      transaction,
      this._processChildContext(context)
    );
    this._renderedComponent._THREEObject3D = nextObject3D;
    
    // fixup _mountImage as well
    this._mountImage = nextObject3D;
    
    // overwrite the old child
    object3DParent.children[object3DIndex] = nextObject3D;
  }
};

//
// This generates a patched version of ReactReconciler.receiveComponent to check the type of the
// component and patch it if it's an unpatched version of ReactCompositeComponentWrapper
//

var buildPatchedReceiveComponent = function(oldReceiveComponent) {
  var newReceiveComponent = function(
        internalInstance, nextElement, transaction, context
  ) {
    // if the instance is a ReactCompositeComponentWrapper, fixed it if needed
    var ComponentPrototype = Object.getPrototypeOf(internalInstance);

    // if this is a composite component it wil have _updateRenderedComponent defined
    if (typeof ComponentPrototype._updateRenderedComponent !== 'undefined') {
      // check first to make sure we don't patch it twice
      if (ComponentPrototype._updateRenderedComponent !== ReactTHREE_updateRenderedComponent) {
	ComponentPrototype._updateRenderedComponent = ReactTHREE_updateRenderedComponent;
      }
    }

    oldReceiveComponent.call(this,internalInstance, nextElement, transaction, context);
  };

  return newReceiveComponent;
};


var ReactTHREEMonkeyPatch = function() {

  // in order version we patched ReactCompositeComponentMixin, but in 0.13 the
  // prototype is wrapped in a ReactCompositeComponentWrapper so monkey-patching
  // ReactCompositeComponentMixin won't actually have any effect.
  //
  // Really we want to patch ReactCompositeComponentWrapper but it's hidden inside
  // the instantiateReactComponent module. urgh.
  //
  // So what we have to do is patch ReactReconciler to detect the first time an
  // instance of ReactCompositeComponentWrapper is used, and patch it THEN
  //
  // urk.

  var old_ReactReconciler_receiveComponent = ReactReconciler.receiveComponent;

  // check to see if we already patched it, so we don't patch again
  if (typeof old_ReactReconciler_receiveComponent._ReactTHREEPatched === 'undefined') {
    warning(false,"patching react to work with react-three");

    ReactReconciler.receiveComponent = buildPatchedReceiveComponent(old_ReactReconciler_receiveComponent);
    ReactReconciler.receiveComponent._ReactTHREEPatched = true;
  }
};

export default ReactTHREEMonkeyPatch;

