var React = require('react');
var ReactMount = require('react/lib/ReactMount');
var ReactUpdates = require('react/lib/ReactUpdates');
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

        var backgroundtype = typeof props.background;
        if (backgroundtype !== 'undefined') {
            // background color should be a number, check it
            warning(backgroundtype === 'number', "The background property of "+
                "the scene component must be a number, not " + backgroundtype);
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

        var backgroundtype = typeof props.background;
        if (backgroundtype !== 'undefined') {
            // background color should be a number, check it
            warning(backgroundtype === 'number', "The background property of "+
                "the scene component must be a number, not " + backgroundtype);
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

module.exports = THREEScene;