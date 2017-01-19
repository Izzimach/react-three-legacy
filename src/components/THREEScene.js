import ReactMount from 'react-dom/lib/ReactMount';
import { listenTo } from 'react-dom/lib/ReactBrowserEventEmitter';
import EventPluginHub from 'react-dom/lib/EventPluginHub';

import * as THREE from 'three';
import THREEObject3DMixin from '../mixins/THREEObject3DMixin';
import {createTHREEComponent} from '../Utils';

import warning from 'fbjs/lib/warning';

const ELEMENT_TYPE_NODE = 1; // can't access this in ReactDOMComponent

//
// The 'Scene' component includes the three.js scene
//

var THREEScene = createTHREEComponent(
  'THREEScene',
  THREEObject3DMixin,
  {
    createTHREEObject: function() {
      return new THREE.Scene();
    },

    applySpecificTHREEProps: function (oldProps, newProps) { // eslint-disable-line no-unused-vars
      // can't bind the camera here since children may not be mounted yet
    },

    mountComponent: function (transaction, nativeParent, nativeContainerInfo, context) {
      let props = this._currentElement.props;
      THREEObject3DMixin.mountComponent.call(this, transaction, nativeParent, nativeContainerInfo, context);
      this._THREEMetaData = {
        camera: null,
        raycaster : new THREE.Raycaster()
      };
      this.bindCamera(props);

      if (props.projectPointerEventRef) {
        props.projectPointerEventRef(this.projectPointerEvent.bind(this));
      }

      // this now gets called by the renderer so that canvas is provided
      //this.bindPointerEvents(rootID, props);
      return this._THREEObject3D;
    },

    receiveComponent: function (nextElement, transaction, context) {
      THREEObject3DMixin.receiveComponent.call(this, nextElement, transaction, context);
    },

    unmountComponent: function() {
      THREEObject3DMixin.unmountComponent.call(this);
    },

    getNativeNode() {
      return this._THREEObject3D;
    },

    bindCamera: function(props) {
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

      this._THREEMetaData.camera = camera;
    },

    bindOrbitControls: function(inst, canvas, props) {
      if (props.orbitControls && typeof props.orbitControls === 'function') {
        if (!this._THREEMetaData.orbitControls && canvas) {
          this._THREEMetaData.orbitControls = new props.orbitControls(this._THREEMetaData.camera, canvas);
        }
      }
    },

    bindPointerEvents: function (inst, canvas, props) {
      if (props.pointerEvents) {
        if (canvas) {
          props.pointerEvents.forEach(eventName => {
            listenTo(eventName, canvas);
            EventPluginHub.putListener(
              inst,
              eventName,
              event => this.projectPointerEvent(event, eventName, canvas) );
          });
        }
      }

    },

    findRootDOMNode: function(rootID) {
      // fiddle with some internals here - probably a bit brittle
      const container = ReactMount.findReactContainerForID(rootID);
      return container;
    },

    findDocumentContainer: function() {
      let container = this.findRootDOMNode();
      if (container) {
        return (container.elementType === ELEMENT_TYPE_NODE ?
                container.ownerDocument :
                container);
      }
      return null;
    },

    projectPointerEvent: function (event, eventName, canvas) {
      event.preventDefault();
      var rect = canvas.getBoundingClientRect();

      const {clientX, clientY} = event.touches ? event.touches[0] : event;
      var x =   ( (clientX - rect.left) / rect.width) * 2 - 1;
      var y = - ( (clientY - rect.top) / rect.height) * 2 + 1;

      var mousecoords = new THREE.Vector3(x,y,0.5);
      let { raycaster, camera } = this._THREEMetaData;

      raycaster.setFromCamera(mousecoords, camera);

      var intersections = raycaster.intersectObjects( this._THREEObject3D.children, true );
      var firstintersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;

      if (firstintersection !== null) {
        var pickobject = firstintersection.object;
        if (typeof pickobject.userData !== 'undefined' && pickobject.userData._currentElement) {
          var onpickfunction = pickobject.userData._currentElement.props[eventName + '3D'];
          if (typeof onpickfunction === 'function') {
            onpickfunction(event, firstintersection);
          }
        }
      }
    }
  }
);

module.exports = THREEScene;
