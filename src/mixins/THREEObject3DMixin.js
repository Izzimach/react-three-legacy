import THREE from 'three';
import assign from 'react/lib/Object.assign';
import THREEContainerMixin from './THREEContainerMixin';

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

        if (typeof props.up !== 'undefined') {
            this._THREEObject3D.up.copy(props.up);
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

    /*eslint no-unused-vars: [2, { "args": "none" }]*/
    mountComponentIntoNode: function(rootID, container) {
        throw new Error(
            'You cannot render an THREE Object3D standalone. ' +
            'You need to wrap it in a THREEScene.'
        );
    }
});

export default THREEObject3DMixin;
