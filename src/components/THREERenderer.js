const React = require('react');
const ReactDOM = require('react-dom');
const ReactMount = require('react/lib/ReactMount');
const ReactUpdates = require('react/lib/ReactUpdates');
const warning = require('fbjs/lib/warning');
const THREE = require('three');
const THREEContainerMixin = require('../mixins/THREEContainerMixin');
const THREEObject3DMixin = require('../mixins/THREEObject3DMixin');

const ReactBrowserEventEmitter = require('react/lib/ReactBrowserEventEmitter');
const putListener = ReactBrowserEventEmitter.putListener;
const listenTo = ReactBrowserEventEmitter.listenTo;

const ELEMENT_NODE_TYPE = 1; // some stuff isn't exposed by ReactDOMComponent

//
// The 'Scene' component includes both the three.js scene and
// the canvas DOM element that three.js renders onto.
//

const THREERenderer = React.createClass({
    displayName: 'THREERenderer',
    mixins: [THREEContainerMixin],

    propTypes: {
        enableRapidRender: React.PropTypes.bool,
        pixelRatio: React.PropTypes.number,
        pointerEvents: React.PropTypes.arrayOf(React.PropTypes.string),
        transparent: React.PropTypes.bool,
        disableHotLoader: React.PropTypes.bool
    },

    getDefaultProps() {
        return {
            enableRapidRender: true,
            pixelRatio: 1,
            transparent: false,
            disableHotLoader: false
        };
    },

    componentDidMount() {
        const renderelement = this.props.canvas || ReactDOM.findDOMNode(this);
        const props = this.props;
        const context = this._reactInternalInstance._context;

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

        const transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
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

        const backgroundtype = typeof props.background;
        if (backgroundtype !== 'undefined') {
            // background color should be a number, check it
            warning(backgroundtype === 'number', "The background property of "+
                "the Renderer component must be a number, not " + backgroundtype);
            this._THREErenderer.setClearColor(props.background, this.props.transparent ? 0 : 1);
        }

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

        renderelement.onselectstart = function() { return false; };
    },

    componentDidUpdate(oldProps) {
        const props = this.props;
        const context = this._reactInternalInstance._context;

        if (props.pixelRatio != oldProps.pixelRatio) {
            this._THREErenderer.setPixelRatio(props.pixelRatio);
        }

        if (props.width != oldProps.width ||
            props.width != oldProps.height ||
            props.pixelRatio != oldProps.pixelRatio) {
            this._THREErenderer.setSize(+props.width, +props.height);
        }

        const backgroundtype = typeof props.background;
        if (backgroundtype !== 'undefined') {
            // background color should be a number, check it
            warning(backgroundtype === 'number', "The background property of "+
                "the scene component must be a number, not " + backgroundtype);
            this._THREErenderer.setClearColor(props.background, this.props.transparent ? 0 : 1);
        }

        const transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
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

        this.renderScene();
    },

    componentWillUnmount() {
        // hack for react-hot-loader
        if (!this.props.disableHotLoader) {
          this._reactInternalInstance._renderedComponent._renderedChildren = null;
        }
        this.unmountChildren();
        ReactBrowserEventEmitter.deleteAllListeners(this._reactInternalInstance._rootNodeID);
        if (typeof this._rAFID !== 'undefined') {
            window.cancelAnimationFrame(this._rAFID);
        }
    },

    renderScene() {
        if (!this.props.children) return;

        const children = this._renderedChildren;

        this._THREErenderer.autoClear = false;
        this._THREErenderer.clear();

        Object.keys(children).forEach(key => {
          const scene = children[key]._instance;
          if (scene._THREEObject3D && scene._THREEcamera) {
              this._THREErenderer.render(
                  scene._THREEObject3D,
                  scene._THREEcamera
              );
          }
        });

    },

    render() {
        if (this.props.canvas) return null;

        // the three.js renderer will get applied to this canvas element
        return React.createElement("canvas");
    }
});

module.exports = THREERenderer;
