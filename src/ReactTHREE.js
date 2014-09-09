
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

var ReactMount = require('react/lib/ReactMount');
var ReactComponent = require('react/lib/ReactComponent');
var ReactComponentMixin = ReactComponent.Mixin;
var ReactUpdates = require('react/lib/ReactUpdates');
var ReactMultiChild = require('react/lib/ReactMultiChild');
var ReactBrowserComponentMixin = require('react/lib/ReactBrowserComponentMixin');
var ReactDescriptor = require('react/lib/ReactDescriptor');

var ReactDOMComponent = require('react/lib/ReactDOMComponent');
var ELEMENT_NODE_TYPE = 1; // some stuff isn't exposed by ReactDOMComponent

//var DOMPropertyOperations = require('react/lib/DOMPropertyOperations');
var ReactBrowserEventEmitter = require('react/lib/ReactBrowserEventEmitter');
var putListener = ReactBrowserEventEmitter.putListener;
var listenTo = ReactBrowserEventEmitter.listenTo;

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

var THREEObject3DMixin = merge(ReactMultiChild.Mixin, {

  applyTHREEObject3DProps: function(oldProps, props) {
    var THREEObject3D = this._THREEObject3D;

    if (typeof props.position !== 'undefined') {
      THREEObject3D.position.copy(props.position);
    }

    if (typeof props.quaternion !== 'undefined') {
      THREEObject3D.quaternion.copy(props.quaternion);
    }

    if (typeof props.visible !== 'undefined') {
      THREEObject3D.visible = props.visible;
    }

    if (typeof props.scale === "number") {
      THREEObject3D.scale.set(props.scale, props.scale, props.scale);
    } else if (props.scale instanceof THREE.Vector3) {
      // copy over scale values
      THREEObject3D.scale.copy(props.scale);
    } else {
      THREEObject3D.scale.set(1,1,1);
    }


    if (typeof props.lookat !== 'undefined') {
      this._THREEObject3D.lookAt(props.lookat);
    }


    if (typeof props.name !== 'undefined') {
      THREEObject3D.name = props.name;
    }
  },

  transferTHREEObject3DPropsByName: function(oldProps, newProps, propnames) {
    var THREEObject3D = this._THREEObject3D;

    propnames.forEach(function(propname) {
      if (typeof newProps[propname] !== 'undefined') {
        THREEObject3D[propname] = newProps[propname];
      }
    });
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

  mountComponent: function(rootID, transaction, mountDepth) {
    /* jshint unused: vars */
    ReactComponentMixin.mountComponent.apply(this, arguments);
    this._THREEObject3D = this.createTHREEObject(arguments);
    this._THREEObject3D.userData = this;
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


// used as a callback for 'onselectstart' event to indicate that the browser shouldn't let you
// select the canvas the way you would select a block of text
var dontselectcanvas = function() { return false; }

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

    _tagOpen: '<canvas',
    _tagClose: '</canvas>',
    /*jshint unused: vars */
    mountComponent: function(rootID, transaction, mountDepth) {
      ReactComponentMixin.mountComponent.apply(this, arguments);
      transaction.getReactMountReady().enqueue(this.componentDidMount, this);

      // this registers listeners so users can handle onClick etc.
      return (
        this._createOpenTagMarkupAndPutListeners(transaction) +
        this._createContentMarkup(transaction) +
        this._tagClose
      );
    },
    /*jshint unused: true */

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

			var camera = props.camera;
      if (typeof camera === 'undefined') {
        camera = new THREE.PerspectiveCamera( 75, props.width / props.height, 1, 5000 );
        camera.aspect = props.width / props.height;
        camera.updateProjectionMatrix();
        camera.position.z = 600;
      }

      this._THREErenderer = new THREE.WebGLRenderer({canvas:renderelement});
      this._THREErenderer.setSize(+props.width, +props.height);
      this._THREEcamera = camera;
      this._THREEprojector = new THREE.Projector();
      this._THREEraycaster = new THREE.Raycaster();
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

      var container = ReactMount.findReactContainerForID(this._rootNodeID);
      if (container) {
        var doc = container.nodeType === ELEMENT_NODE_TYPE ?
            container.ownerDocument :
        container;
        listenTo('onClick', doc);
      }
      putListener(this._rootNodeID, 'onClick', function(event) { that.projectClick(event);});

      renderelement.onselectstart = dontselectcanvas;

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

      if (typeof this.props.camera !== 'undefined' && this.props.camera !== null) {
        this._THREEcamera = this.props.camera;
      }

      this.setApprovedDOMProperties(props);
      this.applyTHREEObject3DProps(this.props, props);

      this.updateChildren(props.children, transaction);
      this.props = props;
      this.renderScene();
    },

    unmountComponent: function() {
      this.unmountChildren();
      ReactBrowserEventEmitter.deleteAllListeners(this._rootNodeID);
      ReactComponent.Mixin.unmountComponent.call(this);
      if (typeof this._rAFID !== 'undefined') {
        window.cancelAnimationFrame(this._rAFID);
      }
    },

    renderScene: function() {
      this._THREErenderer.render(this._THREEObject3D, this._THREEcamera);
    },

    projectClick: function (event) {
      event.preventDefault();
      var rect = this.getDOMNode().getBoundingClientRect();


      var x =   ( (event.clientX - rect.left) / this.props.width) * 2 - 1;
      var y = - ( (event.clientY - rect.top) / this.props.height) * 2 + 1;

      var mousecoords = new THREE.Vector3(x,y,0.5);
      var projector = this._THREEprojector;
      var raycaster = this._THREEraycaster;
      var camera = this._THREEcamera;

      projector.unprojectVector(mousecoords, camera);
      raycaster.ray.set( camera.position, mousecoords.sub( camera.position ).normalize() );

      var intersections = raycaster.intersectObjects( this._THREEObject3D.children, true );
      var firstintersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;

			if (firstintersection !== null) {
        var pickobject = firstintersection.object;
        if (typeof pickobject.userData !== 'undefined' &&
            typeof pickobject.userData.props.onPick === 'function') {
          pickobject.userData.props.onPick(event, firstintersection);
        }
      }
    }
  }
);


var THREEObject3D = defineTHREEComponent(
  'Object3D',
  ReactComponentMixin,
  THREEObject3DMixin);

var THREEMesh = defineTHREEComponent(
  'Mesh',
  ReactComponentMixin,
  THREEObject3DMixin,
  {
    createTHREEObject: function() {
      return new THREE.Mesh(new THREE.Geometry(), new THREE.Material()); // starts out empty
    },

    applySpecificTHREEProps: function (oldProps, newProps) {
      var THREEObject3D = this._THREEObject3D;
      if ((typeof newProps.geometry !== 'undefined') &&
          (newProps.geometry !== oldProps.geometry))
      {
        THREEObject3D.geometry = newProps.geometry;
      }

      if ((typeof newProps.material !== 'undefined') &&
          (newProps.material !== oldProps.material))
      {
        THREEObject3D.material = newProps.material;
      }

    }
  }
);

var LightObjectMixin = {
  applySpecificTHREEProps: function (oldProps, newProps) {
    var THREEObject3D = this._THREEObject3D;
    if ((typeof newProps.color !== 'undefined') &&
        (newProps.color !== oldProps.color))
    {
      THREEObject3D.color = newProps.color;
    }
  }
};

var THREEAmbientLight = defineTHREEComponent(
  'AmbientLight',
  ReactComponentMixin,
  THREEObject3DMixin,
  {
    createTHREEObject: function() {
      return new THREE.AmbientLight(0x000000);
    },

    applySpecificTHREEProps: function (oldProps, newProps) {
      LightObjectMixin.applySpecificTHREEProps.call(this, oldProps, newProps);
    }
  }
);

var THREEPointLight = defineTHREEComponent(
  'PointLight',
  ReactComponentMixin,
  THREEObject3DMixin,
  {
    createTHREEObject: function() {
      return new THREE.PointLight(0xffffff, 1, 100);
    },

    applySpecificTHREEProps: function(oldProps, newProps) {
      LightObjectMixin.applySpecificTHREEProps.call(this, oldProps, newProps);

      this.transferTHREEObject3DPropsByName(oldProps, newProps, ['intensity','distance']);
    }
  }
);

var THREEAreaLight = defineTHREEComponent(
  'AreaLight',
  ReactComponentMixin,
  THREEObject3DMixin,
  {
    createTHREEObject: function() {
      return new THREE.AreaLight(0xffffff, 1);
    },

    applySpecificTHREEProps: function(oldProps, newProps) {
      LightObjectMixin.applySpecificTHREEProps.call(this, oldProps, newProps);

      this.transferTHREEObject3DPropsByName(oldProps, newProps,
                                            ['right',
                                             'normal',
                                             'height',
                                             'width',
                                             'intensity',
                                             'constantAttenuation',
                                             'linearAttenuation',
                                             'quadraticAttenuation']);
    }
  }
);

var CommonShadowmapProps = [
  'shadowCameraNear',
  'shadowCameraFar',
  'shadowCameraVisible',
  'shadowBias',
  'shadowDarkness',
  'shadowMapWidth',
  'shadowMapHeight',
  'shadowMap',
  'shadowMapSize',
  'shadowCamera',
  'shadowMatrix'
];

var THREEDirectionalLight = defineTHREEComponent(
  'DirectionalLight',
  ReactComponentMixin,
  THREEObject3DMixin,
  {
    createTHREEObject: function() {
      return new THREE.DirectionalLight(0xffffff,1);
    },

    applySpecificTHREEProps: function(oldProps, newProps) {
      LightObjectMixin.applySpecificTHREEProps.call(this, oldProps, newProps);

      this.transferTHREEObject3DPropsByName(oldProps, newProps, CommonShadowmapProps);

      this.transferTHREEObject3DPropsByName(oldProps, newProps,
                                            ['target',
                                             'intensity',
                                             'onlyShadow',
                                             'shadowCameraLeft',
                                             'shadowCameraRight',
                                             'shadowCameraTop',
                                             'shadowCameraBottom',
                                             'shadowCascade',
                                             'shadowCascadeOffset',
                                             'shadowCascadeCount',
                                             'shadowCascadeBias',
                                             'shadowCascadeWidth',
                                             'shadowCascadeHeight',
                                             'shadowCascadeNearZ',
                                             'shadowCascadeFarZ',
                                             'shadowCascadeArray']);

    }
  }
);



var THREEHemisphereLight = defineTHREEComponent(
  'HemisphereLight',
  ReactComponentMixin,
  THREEObject3DMixin,
  {
    createTHREEObject: function() {
      return new THREE.HemisphereLight(0x8888ff, 0x000000, 1);
    },

    applySpecificTHREEProps: function(oldProps, newProps) {
      LightObjectMixin.applySpecificTHREEProps.call(this, oldProps, newProps);

      // sky color gets mapped to 'color'
      if (typeof newProps.skyColor !== 'undefined') {
        this._THREEObject3D.color = newProps.skyColor;
      }

      this.transferTHREEObject3DPropsByName(oldProps, newProps,
                                            ['groundColor',
                                             'intensity']);
    }
  }
);


var THREESpotLight = defineTHREEComponent(
  'SpotLight',
  ReactComponentMixin,
  THREEObject3DMixin,
  {
    createTHREEObject: function() {
      return new THREE.SpotLight(0xffffff, 1);
    },

    applySpecificTHREEProps: function(oldProps, newProps) {
      LightObjectMixin.applySpecificTHREEProps.call(this, oldProps, newProps);

      this.transferTHREEObject3DPropsByName(oldProps, newProps, CommonShadowmapProps);
      this.transferTHREEObject3DPropsByName(oldProps, newProps,
                                            ['target',
                                             'intensity',
                                             'distance',
                                             'angle',
                                             'exponent',
                                             'castShadow',
                                             'onlyShadow',
                                             'shadowCameraFov']);
    }
  }
);

var THREELine = defineTHREEComponent(
  'Line',
  ReactComponentMixin,
  THREEObject3DMixin,
  {
    createTHREEObject: function() {
      return new THREE.Line(new THREE.Geometry());
    },

    applySpecificTHREEProps: function(oldProps, newProps) {
      this.transferTHREEObject3DPropsByName(oldProps,newProps,
                                           ['geometry','material','type']);
    }
  }
);

var THREEPointCloud = defineTHREEComponent(
  'PointCloud',
  ReactComponentMixin,
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

var THREESkinnedMesh = defineTHREEComponent(
  'SkinnedMesh',
  ReactComponentMixin,
  THREEObject3DMixin,
  {
    // skinned mesh is special since it needs the geometry and material data upon construction
    /* jshint unused: vars */
    mountComponent: function(rootID, transaction, mountDepth) {
      ReactComponentMixin.mountComponent.apply(this, arguments);
      this._THREEObject3D = new THREE.SkinnedMesh(this.props.geometry, this.props.material);
      this.applyTHREEObject3DProps({}, this.props);
      this.applySpecificTHREEProps({}, this.props);

      this.mountAndAddChildren(this.props.children, transaction);
      return this._THREEObject3D;
    },
    /* jshint unused: true */

    applySpecificTHREEProps: function(/*oldProps, newProps*/) {
    }
  }
);

var THREESprite = defineTHREEComponent(
  'Sprite',
  ReactComponentMixin,
  THREEObject3DMixin,
  {
    createTHREEObject: function() {
      return new THREE.Sprite();
    },

    applySpecificTHREEProps: function(oldProps, newProps) {
      this.transferTHREEObject3DPropsByName(oldProps, newProps,
                                           ['material']);
    }
  }
);

var THREEPerspectiveCamera = defineTHREEComponent(
  'PerspectiveCamera',
  ReactComponentMixin,
  THREEObject3DMixin,
  {
    createTHREEObject: function() {
      return new THREE.PerspectiveCamera();
    },

    applySpecificTHREEProps: function(oldProps, newProps) {
      this.transferTHREEObject3DPropsByName(oldProps, newProps,
                                           ['fov','aspect','near','far']);

      this._THREEObject3D.updateProjectionMatrix();
    }
  });

var THREEOrthographicCamera = defineTHREEComponent(
  'OrthographicCamera',
  ReactComponentMixin,
  THREEObject3DMixin,
  {
    createTHREEObject: function() {
      return new THREE.OrthographicCamera();
    },

    applySpecificTHREEProps: function(oldProps, newProps) {
      this.transferTHREEObject3DPropsByName(oldProps, newProps,
                                           ['left','right','up','bottom','near','far']);

      this._THREEObject3D.updateProjectionMatrix();
    }
  });

//
// module data
//

module.exports =  {
  Scene : THREEScene,
  PerspectiveCamera : THREEPerspectiveCamera,
  OrthographicCamera : THREEOrthographicCamera,
  Object3D : THREEObject3D,
  Line : THREELine,
  PointCloud : THREEPointCloud,
  Mesh : THREEMesh,
  SkinnedMesh : THREESkinnedMesh,
  Sprite : THREESprite,
  AmbientLight : THREEAmbientLight,
  PointLight : THREEPointLight,
  AreaLight: THREEAreaLight,
  DirectionalLight: THREEDirectionalLight,
  HemisphereLight: THREEHemisphereLight,
  SpotLight: THREESpotLight

};
