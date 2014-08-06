
/*
 * Copyright (c) 2014 Gary Haussmann
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//
// Lots of code here is based on react-art: https://github.com/facebook/react-art
//

"use strict";

//var React = require('react/react.js');

var DOMPropertyOperations = require('react/lib/DOMPropertyOperations');
var ReactComponent = require('react/lib/ReactComponent');
var ReactUpdates = require('react/lib/ReactUpdates');
//var ReactMount = require('react/lib/ReactMount');
var ReactMultiChild = require('react/lib/ReactMultiChild');
var ReactBrowserComponentMixin = require('react/lib/ReactBrowserComponentMixin');
var ReactDescriptor = require('react/lib/ReactDescriptor');
var ReactDOMComponent = require('react/lib/ReactDOMComponent');
var ReactComponentMixin = ReactComponent.Mixin;

var mixInto = require('react/lib/mixInto');
var merge = require('react/lib/merge');


//
// Generates a React component by combining several mixin components
//

function defineTHREEComponent(name /* plus mixins */) {

  var ReactTHREEComponent = function() {};
  ReactTHREEComponent.prototype.type = ReactTHREEComponent;
  for (var i = 1; i < arguments.length; i++) {
    mixInto(ReactTHREEComponent, arguments[i]);
  }

  var Constructor = function(props, owner) {
    this.construct(props,owner);
  };
  Constructor.prototype = new ReactTHREEComponent();
  Constructor.prototype.constructor = Constructor;
  Constructor.displayName = name;

  var factory = ReactDescriptor.createFactory(Constructor);
  return factory;
}

var zeroVec3 = new THREE.Vector3(0,0,0);
var zeroQuat = new THREE.Quaternion();

var THREEObject3DMixin = merge(ReactMultiChild.Mixin, {

  applyTHREEObject3DProps: function(oldProps, props) {
    var THREEObject3D = this._THREEObject3D;

    var position = props.position || zeroVec3;
    var rotation = props.rotation || zeroQuat;

    THREEObject3D.position.set(position.x, position.y, position.z);
    THREEObject3D.rotation.set(rotation.x, rotation.y, rotation.z, rotation.w);

    if (typeof props.visible !== 'undefined') {
      THREEObject3D.visible = props.visible;
    }

    var scaletype = typeof props.scale;
    if (scaletype === "number") {
      THREEObject3D.scale.set(scaletype, scaletype, scaletype);
    } else if (scaletype === "object") {
      // copy over scale values
      var scale = props.scale;
      THREEObject3D.scale.set(scale.x, scale.y, scale.z);
    } else {
      THREEObject3D.scale.set(1,1,1);
    }
  },

  mountComponentIntoNode: function() {
    throw new Error(
      'You cannot render a three.js component standalone. ' +
      'You need to wrap it in a THREEScene component.'
    );
  },

  createTHREEObject: function() {
    return new THREE.Object3D();
  },

  applySpecificTHREEProps: function(/*oldProps, newProps*/) {
    // the default props are applied in applyTHREEObject3DProps.
    // to create a new object type, mixin your own version of this method
  },

  mountComponent: function(transaction) {
    ReactComponentMixin.mountComponent.apply(this, arguments);
    this._THREEObject3D = this.createTHREEObject(arguments);
    this.applyTHREEObject3DProps({}, this.props);
    this.applySpecificTHREEProps({}, this.props);

    this.mountAndAddChildren(this.props.children, transaction);
    return this._THREEObject3D;
  },

  receiveComponent: function(nextDescriptor, transaction) {
    var props = nextDescriptor.props;
    this.applyTHREEObject3DProps(this.props, props);
    this.applySpecificTHREEProps(this.props, props);

    this.updateChildren(props.children, transaction);
    this.props = props;
  },

  unmountComponent: function() {
    this.unmountChildren();
  },

  moveChild: function(child, toIndex) {
    var childTHREEObject3D = child._mountImage; // should be a three.js Object3D
    var THREEObject3D = this._THREEObject3D;

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
  updateChildren: function(nextChildren, transaction) {
    this._updateChildren(nextChildren, transaction);
  },

  // called by any container component after it gets mounted

  mountAndAddChildren: function(children, transaction) {
    var mountedImages = this.mountChildren(
      children,
      transaction
    );
    // Each mount image corresponds to one of the flattened children
    var i = 0;
    for (var key in this._renderedChildren) {
      if (this._renderedChildren.hasOwnProperty(key)) {
        var child = this._renderedChildren[key];
        child._mountImage = mountedImages[i];
        this._THREEObject3D.add(child._mountImage);
        i++;
      }
    }
  }

});



//
// Normally THREEObject3D barfs if you try to mount a DOM node, since Object3D objects
// represent three.js entities and not DOM nodes.
//
// However, the Scene is an Object3D that also mounts a DOM node (the canvas)
// so we have to override the error detecting method present in Object3D
//
// Seems a bit hackish. We could split the THREEScene into a Scene and a separate canvas component.
//
var THREESceneMixin = merge(THREEObject3DMixin, {
  mountComponentIntoNode : ReactComponent.Mixin.mountComponentIntoNode
});


//
// The 'Scene' component includes both the three.js scene and
// the canvas DOM element that three.js renders onto.
//
// Maybe split these into two components? Putting a DOM node and a Scene into
// the same component seems a little messy, but splitting them means you would always
// have to declare two components: a THREEScene component inside a Canvas. If there was a situation where
// you would want to 'swap out' one scene for another I suppose we could make a case for it...
// --GJH
//

var THREEScene = defineTHREEComponent(
  'THREEScene',
  ReactBrowserComponentMixin,
  ReactDOMComponent.Mixin,
  ReactComponentMixin,
  THREESceneMixin, {

    mountComponent: function(rootID, transaction, mountDepth) {
      ReactComponentMixin.mountComponent.call(
        this,
        rootID,
        transaction,
        mountDepth
      );
      transaction.getReactMountReady().enqueue(this.componentDidMount, this);
      // Temporary placeholder
      var idMarkup = DOMPropertyOperations.createMarkupForID(rootID);
      return '<canvas ' + idMarkup + '></canvas>';
    },

    setApprovedDOMProperties: function(nextProps) {
      var prevProps = this.props;

      var prevPropsSubset = {
        accesskey: prevProps.accesskey,
        className: prevProps.className,
        draggable: prevProps.draggable,
        role: prevProps.role,
        style: prevProps.style,
        tabindex: prevProps.tabindex,
        title: prevProps.title
      };

      var nextPropsSubset = {
        accesskey: nextProps.accesskey,
        className: nextProps.className,
        draggable: nextProps.draggable,
        role: nextProps.role,
        style: nextProps.style,
        tabindex: nextProps.tabindex,
        title: nextProps.title
      };

      this.props = nextPropsSubset;
      this._updateDOMProperties(prevPropsSubset);

      // Reset to normal state
      this.props = prevProps;
    },

    componentDidMount: function() {
      var props = this._descriptor.props;
      var renderelement = this.getDOMNode();

      this._THREEObject3D = new THREE.Scene();

			var camera = new THREE.PerspectiveCamera( 75, props.width / props.height, 1, 5000 );
      camera.aspect = props.width / props.height;
      camera.updateProjectionMatrix();
		  camera.position.z = 600;

      this._THREErenderer = new THREE.WebGLRenderer({canvas:renderelement});
      this._THREErenderer.setSize(+props.width, +props.height);
      this._THREEcamera = camera;
      this.setApprovedDOMProperties(props);
      this.applyTHREEObject3DProps({},this.props);

      var transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
      transaction.perform(
        this.mountAndAddChildren,
        this,
        props.children,
        transaction
      );
      ReactUpdates.ReactReconcileTransaction.release(transaction);
      this.renderScene();

      var that = this;
      that._rAFID = window.requestAnimationFrame( rapidrender );

      function rapidrender(timestamp) {

        that._timestamp = timestamp;
        that._rAFID = window.requestAnimationFrame( rapidrender );

        // render the stage
        that.renderScene();
      }

      this.props = props;
    },

    receiveComponent: function(nextDescriptor, transaction) {
      // Descriptors are immutable, so if the descriptor hasn't changed
      // we don't need to do anything
      if (nextDescriptor === this._descriptor &&
          nextDescriptor._owner !== null) {
        return;
      }

      ReactComponent.Mixin.receiveComponent.call(this, nextDescriptor, transaction);

      var props = nextDescriptor.props;

      if (this.props.width != props.width || this.props.width != props.height) {
        this._THREErenderer.setSize(+props.width, +props.height);
      }

      this.setApprovedDOMProperties(props);
      this.applyTHREEObject3DProps(this.props, props);

      this.updateChildren(props.children, transaction);
      this.renderScene();
    },

    unmountComponent: function() {
      ReactComponentMixin.unmountComponent.call(this);
      if (typeof this._rAFID !== 'undefined') {
        window.cancelAnimationFrame(this._rAFID);
      }
      this.unmountChildren();
    },

    renderScene: function() {
      this._THREErenderer.render(this._THREEObject3D, this._THREEcamera);
    }

  }
);

var MeshObjectMixin = {
  createTHREEObject: function() {
    return new THREE.Mesh(new THREE.Geometry(), new THREE.Material()); // starts out empty
  },

  applySpecificTHREEProps: function (oldProps, newProps) {
    var THREEObject3D = this._THREEObject3D;
    if ((typeof newProps.geometry !== 'undefined') &&
        (newProps.geometry !== oldProps.geometry))
    {
      // make a local copy unless it's shared
      if (newProps.shared === true) {
        THREEObject3D.geometry = newProps.geometry;
      }
      else {
        THREEObject3D.geometry = newProps.geometry.clone();
      }

    }

    if ((typeof newProps.material !== 'undefined') &&
        (newProps.material !== oldProps.material))
    {
      if (newProps.shared === true) {
        THREEObject3D.material = newProps.material;
      }
      else {
        THREEObject3D.material = newProps.material.clone(THREEObject3D.material);
      }
    }

  }
};

var THREEObject3D = defineTHREEComponent(
  'Object3D',
  ReactComponentMixin,
  THREEObject3DMixin);

var THREEMesh = defineTHREEComponent(
  'Mesh',
  ReactComponentMixin,
  THREEObject3DMixin,
  MeshObjectMixin);

// module data

module.exports =  {
  Scene: THREEScene,
  Object3D: THREEObject3D,
  Mesh: THREEMesh
};


