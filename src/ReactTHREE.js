
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

var React = require('react');
var THREE = require('three');

var ReactMount = require('react/lib/ReactMount');
var ReactUpdates = require('react/lib/ReactUpdates');
var ReactMultiChild = require('react/lib/ReactMultiChild');

var ELEMENT_NODE_TYPE = 1; // some stuff isn't exposed by ReactDOMComponent

var ReactBrowserEventEmitter = require('react/lib/ReactBrowserEventEmitter');
var putListener = ReactBrowserEventEmitter.putListener;
var listenTo = ReactBrowserEventEmitter.listenTo;

var assign = require('react/lib/Object.assign');
var emptyObject = require('react/lib/emptyObject');
var warning = require('react/lib/warning');

// monkey patch to workaround some assumptions that we're working with the DOM
var monkeypatch = require('./ReactTHREEMonkeyPatch');
monkeypatch();


//
// Generates a React component by combining several mixin components
//

function createTHREEComponent(name /* plus mixins */) {

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
}


var THREEContainerMixin = assign({},  ReactMultiChild.Mixin, {
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
  updateChildren: function(nextChildren, transaction, context) {
    this._updateChildren(nextChildren, transaction, context);
  },

  updateChildrenAtRoot: function (nextChildren, transaction) {
    this.updateChildren(nextChildren, transaction, emptyObject);
  },

  // called by any container component after it gets mounted
  mountAndAddChildren: function(children, transaction, context) {
    var mountedImages = this.mountChildren(
      children,
      transaction,
      context
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
  },

  mountAndAddChildrenAtRoot: function(children, transaction) {
    this.mountAndAddChildren(children, transaction, emptyObject);
  }
});

//
// The container methods are use by both the THREEScene composite component
// and by THREEObject3D components, so container/child stuff is in a separate
// mixin (THREEContainerMixin) and here gets merged into the typical THREE
// node methods for applying and updating props
//
var THREEObject3DMixin = assign({}, THREEContainerMixin, {

  construct: function(element) {
    this._currentElement = element;
    this._THREEObject3D = null;
  },

  getPublicInstance: function() {
    return this._THREEObject3D;
  },
  
  createTHREEObject: function() {
    return new THREE.Object3D();
  },

  applyTHREEObject3DProps: function(oldProps, props) {
    this.applyTHREEObject3DPropsToObject(this._THREEObject3D, oldProps, props);
  },

  applyTHREEObject3DPropsToObject: function(THREEObject3D, oldProps, props) {
    // these props have defaults
    if (typeof props.position !== 'undefined') {
      THREEObject3D.position.copy(props.position);
    } else {
      THREEObject3D.position.set(0,0,0);
    }

    if (typeof props.quaternion !== 'undefined') {
      THREEObject3D.quaternion.copy(props.quaternion);
    } else {
      THREEObject3D.quaternion.set(0,0,0,1); // no rotation
    }

    if (typeof props.visible !== 'undefined') {
      THREEObject3D.visible = props.visible;
    } else {
      THREEObject3D.visible = true;
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

  applySpecificTHREEProps: function(/*oldProps, newProps*/) {
    // the default props are applied in applyTHREEObject3DProps.
    // to create a new object type, mixin your own version of this method
  },

  mountComponent: function(rootID, transaction, context) {
    var props = this._currentElement.props;
    /* jshint unused: vars */
    this._THREEObject3D = this.createTHREEObject(arguments);
    this._THREEObject3D.userData = this;
    this.applyTHREEObject3DProps({}, props);
    this.applySpecificTHREEProps({}, props);

    this.mountAndAddChildren(props.children, transaction, context);
    return this._THREEObject3D;
  },

  receiveComponent: function(nextElement, transaction, context) {
    var oldProps = this._currentElement.props;
    var props = nextElement.props;
    this.applyTHREEObject3DProps(oldProps, props);
    this.applySpecificTHREEProps(oldProps, props);

    this.updateChildren(props.children, transaction, context);
    this._currentElement = nextElement;
  },

  unmountComponent: function() {
    this.unmountChildren();
  },

  mountComponentIntoNode: function(rootID, container) {
    /* jshint unused: vars */
    throw new Error(
      'You cannot render an THREE Object3D standalone. ' +
      'You need to wrap it in a THREEScene.'
    );
  }
});

//
// The 'Scene' component includes both the three.js scene and
// the canvas DOM element that three.js renders onto.
//

var THREEScene = React.createClass({
  displayName: 'THREEScene',
  mixins: [THREEContainerMixin],

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
    var renderelement = this.getDOMNode();
    var props = this.props;

//    var instance = this._reactInternalInstance._renderedComponent;

    this._THREEObject3D = new THREE.Scene();
    this._THREErenderer = new THREE.WebGLRenderer({
        canvas: renderelement,
        antialias: props.antialias === undefined ? true : props.antialias
    });
    this._THREErenderer.setSize(+props.width, +props.height);
    this._THREEraycaster = new THREE.Raycaster();
    //this.setApprovedDOMProperties(props);
    THREEObject3DMixin.applyTHREEObject3DPropsToObject(this._THREEObject3D, {}, props);

    var transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
    transaction.perform(
      this.mountAndAddChildrenAtRoot,
      this,
      props.children,
      transaction
    );
    ReactUpdates.ReactReconcileTransaction.release(transaction);

    // can't look for refs until children get mounted
    var camera = props.camera;
    if (typeof camera === 'string') {
      camera = this._THREEObject3D.getObjectByName(camera, true);
    }
    else if (camera === null || (typeof camera === 'undefined')) {
      warning(false, "No camera prop specified for react-three scene, using 'maincamera'");
      // look for a 'maincamera' object; if none, then make a default camera
      camera = this._THREEObject3D.getObjectByName('maincamera', true);
      if (typeof camera === 'undefined') {
        warning(false, "No camera named 'maincamera' found, creating a default camera");
        camera = new THREE.PerspectiveCamera( 75, props.width / props.height, 1, 5000 );
        camera.aspect = props.width / props.height;
        camera.updateProjectionMatrix();
        camera.position.z = 600;
      }
    }

    if (typeof props.background !== 'undefined') {
      // background color should be a number, check it
      warning(typeof props.background === 'number', "The background property of "+
	      "the scene component must be a number, not " + typeof props.background);
      this._THREErenderer.setClearColor(props.background);

    }

    this._THREEcamera = camera;

    this.renderScene();

    var that = this;
    that._rAFID = window.requestAnimationFrame( rapidrender );

    function rapidrender(timestamp) {

      that._timestamp = timestamp;
      that._rAFID = window.requestAnimationFrame( rapidrender );

      // render the stage
      that.renderScene();
    }

    // fiddle with some internals here - probably a bit brittle
    var internalInstance = this._reactInternalInstance;
    var container = ReactMount.findReactContainerForID(internalInstance._rootNodeID);
    if (container) {
      var doc = container.nodeType === ELEMENT_NODE_TYPE ?
          container.ownerDocument :
      container;
      listenTo('onClick', doc);
    }
    putListener(internalInstance._rootNodeID, 'onClick', function(event) { that.projectClick(event);});

    renderelement.onselectstart = function() { return false; };
  },

  componentDidUpdate: function(oldProps) {
    var props = this.props;

    if (props.width != oldProps.width ||
          props.width != oldProps.height) {
      this._THREErenderer.setSize(+props.width, +props.height);
    }

    if (props.background !== 'undefined') {
      this._THREErenderer.setClearColor(props.background);
    }

    THREEObject3DMixin.applyTHREEObject3DPropsToObject(this._THREEObject3D, oldProps, props);

    var transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
    transaction.perform(
      this.updateChildrenAtRoot,
      this,
      this.props.children,
      transaction
    );
    ReactUpdates.ReactReconcileTransaction.release(transaction);

    if (typeof props.camera === 'string') {
      this._THREEcamera = this._THREEObject3D.getObjectByName(props.camera);
    } else {
      THREEObject3DMixin.applyTHREEObject3DPropsToObject(this._THREEcamera, oldProps.camera || {}, props.camera || {});
    }

    this.renderScene();
  },

  componentWillUnmount: function() {
    this.unmountChildren();
    ReactBrowserEventEmitter.deleteAllListeners(this._reactInternalInstance._rootNodeID);
    if (typeof this._rAFID !== 'undefined') {
      window.cancelAnimationFrame(this._rAFID);
    }
  },

  renderScene: function() {
    this._THREErenderer.render(this._THREEObject3D, this._THREEcamera);
  },

  render: function() {
    // the three.js renderer will get applied to this canvas element
    return React.createElement("canvas");
  },

  projectClick: function (event) {
    event.preventDefault();
    var rect = this.getDOMNode().getBoundingClientRect();


    var x =   ( (event.clientX - rect.left) / this.props.width) * 2 - 1;
    var y = - ( (event.clientY - rect.top) / this.props.height) * 2 + 1;

    var mousecoords = new THREE.Vector3(x,y,0.5);
    var raycaster = this._THREEraycaster;
    var camera = this._THREEcamera;

    mousecoords.unproject(camera);
    raycaster.ray.set( camera.position, mousecoords.sub( camera.position ).normalize() );

    var intersections = raycaster.intersectObjects( this._THREEObject3D.children, true );
    var firstintersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;

    if (firstintersection !== null) {
      var pickobject = firstintersection.object;
      if (typeof pickobject.userData !== 'undefined' && pickobject.userData._currentElement) {
	var onpickfunction = pickobject.userData._currentElement.props.onPick;
	if (typeof onpickfunction === 'function') {
	  onpickfunction(event, firstintersection);
	}
      }
    }
  }
});


var THREEObject3D = createTHREEComponent(
  'Object3D',
  THREEObject3DMixin);

var THREEMesh = createTHREEComponent(
  'Mesh',
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

var THREEAmbientLight = createTHREEComponent(
  'AmbientLight',
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

var THREEPointLight = createTHREEComponent(
  'PointLight',
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

var THREEAreaLight = createTHREEComponent(
  'AreaLight',
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

var THREEDirectionalLight = createTHREEComponent(
  'DirectionalLight',
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



var THREEHemisphereLight = createTHREEComponent(
  'HemisphereLight',
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


var THREESpotLight = createTHREEComponent(
  'SpotLight',
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

var THREELine = createTHREEComponent(
  'Line',
  THREEObject3DMixin,
  {
    createTHREEObject: function() {
      return new THREE.Line(new THREE.Geometry());
    },

    applySpecificTHREEProps: function(oldProps, newProps) {
      this.transferTHREEObject3DPropsByName(oldProps,newProps,
                                           ['geometry','material','mode']);
    }
  }
);

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

var THREESprite = createTHREEComponent(
  'Sprite',
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

var THREEPerspectiveCamera = createTHREEComponent(
  'PerspectiveCamera',
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

var THREEOrthographicCamera = createTHREEComponent(
  'OrthographicCamera',
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
  }
);

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
