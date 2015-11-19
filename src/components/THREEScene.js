var React = require('react');
var ReactDOM = require('react-dom');
var ReactMount = require('react/lib/ReactMount');
var ReactUpdates = require('react/lib/ReactUpdates');
var warning = require('fbjs/lib/warning');
var THREE = require('three');
var THREEContainerMixin = require('../mixins/THREEContainerMixin');
var THREEObject3DMixin = require('../mixins/THREEObject3DMixin');

var ReactBrowserEventEmitter = require('react/lib/ReactBrowserEventEmitter');
var putListener = ReactBrowserEventEmitter.putListener;
var listenTo = ReactBrowserEventEmitter.listenTo;

var ELEMENT_NODE_TYPE = 1; // some stuff isn't exposed by ReactDOMComponent

//
// The 'Scene' component includes both the three.js scene and
// the canvas DOM element that three.js renders onto.
//

var THREEScene = React.createClass({
    displayName: 'THREEScene',
    mixins: [THREEContainerMixin],

    mountComponent(rootID, transaction, context) {

        var props = this._currentElement.props;
        /* jshint unused: vars */
        this._THREEObject3D.userData = this;

        this.mountAndAddChildren(props.children, transaction, context);
        return this._THREEObject3D;
    },

    propTypes: {
        pointerEvents: React.PropTypes.arrayOf(React.PropTypes.string),
        disableHotLoader: React.PropTypes.bool
    },

    getDefaultProps() {
        return {
            disableHotLoader: false
        };
    },

    componentDidMount() {
        let props = this.props;
        let context = this._reactInternalInstance._context;

        this._THREEObject3D = new THREE.Scene();
        THREEObject3DMixin.applyTHREEObject3DPropsToObject(this._THREEObject3D, {}, props);

        var transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
        transaction.perform(
          this.mountAndAddChildren,
          this,
          props.children,
          transaction,
      	  context
        );
        ReactUpdates.ReactReconcileTransaction.release(transaction);
        // hack for react-hot-loader
        if (!this.props.disableHotLoader) {
          this._reactInternalInstance._renderedComponent._renderedChildren = this._renderedChildren;
        }

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

        this._THREEcamera = camera;

        this.mountOrbitControls(props);

        // warn users of the old listenToClick prop
        warning(typeof props.listenToClick === 'undefined', "the `listenToClick` prop has been replaced with `pointerEvents`");

        if (props.pointerEvents) {
            // fiddle with some internals here - probably a bit brittle
            const internalInstance = this._reactInternalInstance;
            const container = ReactMount.findReactContainerForID(internalInstance._rootNodeID);

            props.pointerEvents.forEach(eventName => {
                if (container) {
                    const doc = container.nodeType === ELEMENT_NODE_TYPE ?
                        container.ownerDocument :
                        container;
                    listenTo(eventName, doc);
                }
                putListener(
                  internalInstance._rootNodeID,
                  eventName,
                  event => this.projectPointerEvent(event, eventName) );
            });
        }
    },

    componentDidUpdate(oldProps) {
        let props = this.props;
        let context = this._reactInternalInstance._context;

        THREEObject3DMixin.applyTHREEObject3DPropsToObject(this._THREEObject3D, oldProps, props);

        let transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
        transaction.perform(
          this.updateChildren,
          this,
          this.props.children,
          transaction,
      	  context
        );
        ReactUpdates.ReactReconcileTransaction.release(transaction);
        // hack for react-hot-loader
        if (!this.props.disableHotLoader) {
          this._reactInternalInstance._renderedComponent._renderedChildren = this._renderedChildren;
        }

        if (typeof props.camera === 'string') {
            this._THREEcamera = this._THREEObject3D.getObjectByName(props.camera);
        } else {
            THREEObject3DMixin.applyTHREEObject3DPropsToObject(this._THREEcamera, oldProps.camera || {}, props.camera || {});
        }

        this.mountOrbitControls(props);
    },

    componentWillUnmount() {
        // hack for react-hot-loader
        if (!this.props.disableHotLoader) {
          this._reactInternalInstance._renderedComponent._renderedChildren = null;
        }
        this.unmountChildren();
        ReactBrowserEventEmitter.deleteAllListeners(this._reactInternalInstance._rootNodeID);
    },

    mountOrbitControls(props) {
        if (props.orbitControls) {
            if (!this.orbitControls) {
                this.orbitControls = new props.orbitControls(this._THREEcamera, ReactDOM.findDOMNode(this));
            }
        }
    },

    render() {
      return null;
    },

    projectPointerEvent (event, eventName) {
        event.preventDefault();
        var canvas = this.props.canvas || ReactDOM.findDOMNode(this);
        var rect = canvas.getBoundingClientRect();

        const {clientX, clientY} = event.touches ? event.touches[0] : event;
        var x =   ( (clientX - rect.left) / this.props.width) * 2 - 1;
        var y = - ( (clientY - rect.top) / this.props.height) * 2 + 1;

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
                var onpickfunction = pickobject.userData._currentElement.props[eventName + '3D'];
                if (typeof onpickfunction === 'function') {
                    onpickfunction(event, firstintersection);
                }
            }
        }
    }
});

module.exports = THREEScene;
