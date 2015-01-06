
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

var ReactMount = require('react/lib/ReactMount');
var ReactComponent = require('react/lib/ReactComponent');
var ReactComponentMixin = ReactComponent.Mixin;
var ReactUpdates = require('react/lib/ReactUpdates');
var ReactMultiChild = require('react/lib/ReactMultiChild');
var ReactBrowserComponentMixin = require('react/lib/ReactBrowserComponentMixin');
var ReactElement = require('react/lib/ReactElement');
var ReactLegacyElement = require('react/lib/ReactLegacyElement');

var ReactDOMComponent = require('react/lib/ReactDOMComponent');
var ELEMENT_NODE_TYPE = 1; // some stuff isn't exposed by ReactDOMComponent

//var DOMPropertyOperations = require('react/lib/DOMPropertyOperations');
var ReactBrowserEventEmitter = require('react/lib/ReactBrowserEventEmitter');
var putListener = ReactBrowserEventEmitter.putListener;
var listenTo = ReactBrowserEventEmitter.listenTo;

var assign = require('react/lib/Object.assign');
var warning = require('react/lib/warning');

var Detector = require('../vendor/Detector.js');


//
// Generates a React component by combining several mixin components
//

function createTHREEComponent(name /* plus mixins */) {

  var ReactTHREEComponent = function(props) {
    /* jshint unused: vars */
    this.node = null;
    this._mountImage = null;
    this._renderedChildren = null;
    this.displayObject = null;
  };
  ReactTHREEComponent.displayName = name;
  for (var i = 1; i < arguments.length; i++) {
    assign(ReactTHREEComponent.prototype, arguments[i]);
  }

  return ReactLegacyElement.wrapFactory(
    ReactElement.createFactory(ReactTHREEComponent)
  );
}

var THREEObject3DMixin = assign({}, ReactMultiChild.Mixin, {

  applyTHREEObject3DProps: function(oldProps, props) {
    this.applyTHREEObject3DPropsToObject(this._THREEObject3D, oldProps, props);
  },

  applyTHREEObject3DPropsToObject: function(THREEObject3D, oldProps, props) {
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
var THREESceneMixin = assign({}, THREEObject3DMixin, {
  mountComponentIntoNode : ReactComponent.Mixin.mountComponentIntoNode
});


// used as a callback for 'onselectstart' event to indicate that the browser shouldn't let you
// select the canvas the way you would select a block of text
var dontselectcanvas = function() { return false; };

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

var THREEScene = createTHREEComponent(
  'THREEScene',
  ReactBrowserComponentMixin,
  ReactDOMComponent.Mixin,
  ReactComponentMixin,
  THREESceneMixin, {

    _tag: 'canvas',
    _tagClose: '</canvas>',
    /*jshint unused: vars */
    mountComponent: function(rootID, transaction, mountDepth) {
      ReactComponentMixin.mountComponent.apply(this, arguments);
      transaction.getReactMountReady().enqueue(this.componentDidMount, this);

      // this registers listeners so users can handle onClick etc.
      return (
        this._createOpenTagMarkupAndPutListeners(transaction) +
        // content is basically children, which should not be generating HTML
        //this._createContentMarkup(transaction) +
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
      var props = this._currentElement.props;
      var renderelement = this.getDOMNode();

      this._THREEObject3D = new THREE.Scene();

      this._THREErenderer = Detector.webgl ?
        new THREE.WebGLRenderer({canvas:renderelement}) :
        new THREE.CanvasRenderer({canvas:renderelement});
      this._THREErenderer.setSize(+props.width, +props.height);
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
      // backward compability -- for now
      else if (typeof camera === 'object') {
        warning(false,"As of 0.2.0 the 'camera' prop in a react-three scene " +
          "should be a string specifying the name of a camera component.");

        // pass the object through if it's a Camera object. If not, make a
        // default camera object and copy over props
        if (!(camera instanceof THREE.Camera)) {
          camera = new THREE.PerspectiveCamera( 75, props.width / props.height, 1, 5000 );
          camera.aspect = props.width / props.height;
          camera.updateProjectionMatrix();
          camera.position.z = 600;
          this.applyTHREEObject3DPropsToObject(camera, {}, props.camera);
        }
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

      this.setApprovedDOMProperties(props);
      this.applyTHREEObject3DProps(this.props, props);

      this.updateChildren(props.children, transaction);

      if (typeof props.camera === 'string') {
        this._THREEcamera = this._THREEObject3D.getObjectByName(props.camera);
      } else {
        this.applyTHREEObject3DPropsToObject(this._THREEcamera, this.props.camera || {}, props.camera || {});
      }


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


var THREEObject3D = createTHREEComponent(
  'Object3D',
  ReactComponentMixin,
  THREEObject3DMixin);

var THREEMesh = createTHREEComponent(
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

var THREEAmbientLight = createTHREEComponent(
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

var THREEPointLight = createTHREEComponent(
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

var THREEAreaLight = createTHREEComponent(
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

var THREEDirectionalLight = createTHREEComponent(
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



var THREEHemisphereLight = createTHREEComponent(
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


var THREESpotLight = createTHREEComponent(
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

var THREELine = createTHREEComponent(
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

var THREEPointCloud = createTHREEComponent(
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

var THREESkinnedMesh = createTHREEComponent(
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

var THREESprite = createTHREEComponent(
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

var THREEPerspectiveCamera = createTHREEComponent(
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

var THREEOrthographicCamera = createTHREEComponent(
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
  SpotLight: THREESpotLight,
  createClass : React.createClass // should monkey-patch this eventually

};
