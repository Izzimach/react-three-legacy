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

    propTypes: {
        enableRapidRender: React.PropTypes.bool,
        pixelRatio: React.PropTypes.number,
        pointerEvents: React.PropTypes.arrayOf(React.PropTypes.string),
        transparent: React.PropTypes.bool
    },

    getDefaultProps() {
        return {
            enableRapidRender: true,
            pixelRatio: 1,
            transparent: false
        };
    },

    setApprovedDOMProperties(nextProps) {
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

    componentDidMount() {
        let renderelement = this.props.canvas || ReactDOM.findDOMNode(this);
        let props = this.props;
        let context = this._reactInternalInstance._context;

        this._THREEObject3D = new THREE.Scene();
        this._THREErenderer = new THREE.WebGLRenderer({
            alpha: this.props.transparent,
            canvas: renderelement,
            antialias: props.antialias === undefined ? true : props.antialias
        });
        this._THREErenderer.shadowMap.enabled = props.shadowMapEnabled !== undefined ? props.shadowMapEnabled : false;
        if (props.shadowMapType !== undefined) {
            this._THREErenderer.shadowMap.type = props.shadowMapType;
        }
        this._THREErenderer.setPixelRatio(props.pixelRatio);
        this._THREErenderer.setSize(+props.width, +props.height);
        this._THREEraycaster = new THREE.Raycaster();
        //this.setApprovedDOMProperties(props);
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
        this._reactInternalInstance._renderedComponent._renderedChildren = this._renderedChildren;

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

        var backgroundtype = typeof props.background;
        if (backgroundtype !== 'undefined') {
            // background color should be a number, check it
            warning(backgroundtype === 'number', "The background property of "+
                "the scene component must be a number, not " + backgroundtype);
            this._THREErenderer.setClearColor(props.background, this.props.transparent ? 0 : 1);
        }

        this._THREEcamera = camera;

        this.mountOrbitControls(props);

        this.renderScene();

        // The canvas gets re-rendered every frame even if no props/state changed.
        // This is because some three.js items like skinned meshes need redrawing
        // every frame even if nothing changed in React props/state.
        //
        // See https://github.com/Izzimach/react-three/issues/28

        if (this.props.enableRapidRender) {
            const rapidrender = (timestamp) => {

                this._timestamp = timestamp;
                this._rAFID = window.requestAnimationFrame( rapidrender );

                // render the stage
                this.renderScene();
            }

            this._rAFID = window.requestAnimationFrame( rapidrender );
        }

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

        renderelement.onselectstart = function() { return false; };
    },

    componentDidUpdate(oldProps) {
        let props = this.props;
        let context = this._reactInternalInstance._context;

        if (props.pixelRatio != oldProps.pixelRatio) {
            this._THREErenderer.setPixelRatio(props.pixelRatio);
        }

        if (props.width != oldProps.width ||
            props.width != oldProps.height ||
            props.pixelRatio != oldProps.pixelRatio) {
            this._THREErenderer.setSize(+props.width, +props.height);
        }

        var backgroundtype = typeof props.background;
        if (backgroundtype !== 'undefined') {
            // background color should be a number, check it
            warning(backgroundtype === 'number', "The background property of "+
                "the scene component must be a number, not " + backgroundtype);
            this._THREErenderer.setClearColor(props.background, this.props.transparent ? 0 : 1);
        }

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
        this._reactInternalInstance._renderedComponent._renderedChildren = this._renderedChildren;

        if (typeof props.camera === 'string') {
            this._THREEcamera = this._THREEObject3D.getObjectByName(props.camera);
        } else {
            THREEObject3DMixin.applyTHREEObject3DPropsToObject(this._THREEcamera, oldProps.camera || {}, props.camera || {});
        }

        this.mountOrbitControls(props);

        this.renderScene();
    },

    componentWillUnmount() {
        // hack for react-hot-loader
        this._reactInternalInstance._renderedComponent._renderedChildren = null;
        this.unmountChildren();
        ReactBrowserEventEmitter.deleteAllListeners(this._reactInternalInstance._rootNodeID);
        if (typeof this._rAFID !== 'undefined') {
            window.cancelAnimationFrame(this._rAFID);
        }
    },

    mountOrbitControls(props) {
        if (props.orbitControls) {
            if (!this.orbitControls) {
                this.orbitControls = new props.orbitControls(this._THREEcamera, ReactDOM.findDOMNode(this));
            }
        }
    },

    renderScene() {
        this._THREErenderer.render(this._THREEObject3D, this._THREEcamera);
    },

    render() {
        if (this.props.canvas) return null;

        // the three.js renderer will get applied to this canvas element
        return React.createElement("canvas");
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
