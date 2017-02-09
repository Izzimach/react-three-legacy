import React from 'react';

import ReactDOM from 'react-dom';
import ReactUpdates from 'react-dom/lib/ReactUpdates';
import warning from 'fbjs/lib/warning';
import * as THREE from 'three';
import THREEContainerMixin from '../mixins/THREEContainerMixin';

import EventPluginHub from 'react-dom/lib/EventPluginHub';

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
    disableHotLoader: React.PropTypes.bool,
    customRender: React.PropTypes.func,
    style: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      enableRapidRender: true,
      pixelRatio: 1,
      transparent: false,
      disableHotLoader: false,
      style: {},
      rendererProps: {}
    };
  },

  componentDidMount() {
    const renderelement = this.props.canvas || ReactDOM.findDOMNode(this);
    const props = this.props;
    const context = this._reactInternalInstance._context;

    // manually mounting things in a 'createClass' component messes up react internals
    // need to fix up some fields
    this._rootNodeID = "";

    this._customRender = this.props.customRender;
    this._THREErenderer = new THREE.WebGLRenderer({
      alpha: this.props.transparent,
      canvas: renderelement,
      antialias: props.antialias === undefined ? true : props.antialias,
      ...this.props.rendererProps
    });
    this._THREErenderer.shadowMap.enabled = props.shadowMapEnabled !== undefined ? props.shadowMapEnabled : false;
    if (props.shadowMapType !== undefined) {
      this._THREErenderer.shadowMap.type = props.shadowMapType;
    }
    this._THREErenderer.setPixelRatio(props.pixelRatio);
    this._THREErenderer.setSize(+props.width, +props.height);

    this._debugID = this._reactInternalInstance._debugID;

    const transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
    transaction.perform(
      this.mountAndAddChildren,
      this,
      props.children,
      transaction,
      context
    );
    ReactUpdates.ReactReconcileTransaction.release(transaction);

    // THREEScene binds the pointer events and orbit camera but needs a canvas/DOM element to bind to.
    // The canvas is stored in the renderer, though, so we have to get the canvas here in the renderer and
    // then bind pointer events/orbit controls in child scenes
    const renderedComponent = this._reactInternalInstance._renderedComponent;
    const renderedChildren = this._renderedChildren;
    if (renderedChildren) {
      for (var childkey in renderedChildren) {
        if (renderedChildren.hasOwnProperty(childkey)) {
          let child = renderedChildren[childkey];
          child.bindOrbitControls(renderedComponent, renderelement, child._currentElement.props);
          child.bindPointerEvents(renderedComponent, renderelement, child._currentElement.props);
        }
      }
    }

    // hack for react-hot-loader
    if (!this.props.disableHotLoader &&
        renderedComponent._currentElement !== null) {
      renderedComponent._renderedChildren = this._renderedChildren;
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
        if (typeof this._rAFID !== 'undefined') {
          this._rAFID = window.requestAnimationFrame( rapidrender );
        }

        // render the stage
        this.renderScene();
      }

      this._rAFID = window.requestAnimationFrame( rapidrender );
    }

    // warn users of the old listenToClick prop
    warning(typeof props.listenToClick === 'undefined', "the `listenToClick` prop has been replaced with `pointerEvents`");

    renderelement.onselectstart = () => false;
  },

  componentDidUpdate(oldProps) {
    const props = this.props;
    const context = this._reactInternalInstance._context;

    if (props.pixelRatio !== oldProps.pixelRatio) {
      this._THREErenderer.setPixelRatio(props.pixelRatio);
    }

    if (props.width !== oldProps.width ||
        props.height !== oldProps.height ||
        props.pixelRatio !== oldProps.pixelRatio) {
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
    const renderedComponent = this._reactInternalInstance._renderedComponent;
    if (!this.props.disableHotLoader &&
        renderedComponent._currentElement !== null) {
      renderedComponent._renderedChildren = this._renderedChildren;
    }

    this.renderScene();
  },

  componentWillUnmount() {
    // hack for react-hot-loader
    const renderedComponent = this._reactInternalInstance._renderedComponent;
    if (!this.props.disableHotLoader &&
        renderedComponent._currentElement !== null) {
      renderedComponent._renderedChildren = null;
    }
    EventPluginHub.deleteAllListeners(this._reactInternalInstance);
    if (typeof this._rAFID !== 'undefined') {
      window.cancelAnimationFrame(this._rAFID);
      delete this._rAFID;
    }
  },

  renderScene() {
    if (!this.props.children) return;

    const children = this._renderedChildren;

    this._THREErenderer.autoClear = false;
    this._THREErenderer.clear();

    Object.keys(children).forEach(key => {
      const scene = children[key];
      if (scene._THREEObject3D &&
          scene._THREEMetaData.camera !== null) {
        if (this._customRender) {
          this._customRender(
            this._THREErenderer,
            scene._THREEObject3D,
            scene._THREEMetaData.camera
          );
        }
        else {
          this._THREErenderer.render(
            scene._THREEObject3D,
            scene._THREEMetaData.camera
          );
        }
      }
    });

  },

  render() {
    if (this.props.canvas) return null;

    // the three.js renderer will get applied to this canvas element
    return React.createElement("canvas", {style: this.props.style});
  }
});

export default THREERenderer;
