import THREE from 'three';
import { createTHREEComponent } from '../../Utils';
import THREEObject3DMixin from '../../mixins/THREEObject3DMixin';

export default createTHREEComponent(
  'THREEDecoratorHelper',
  THREEObject3DMixin,
  {
    createTHREEObject() {
      return new THREE.Object3D();
    },

    applySpecificTHREEProps(/*oldProps, newProps*/) {
      // can't apply helpers here since the children haven't be mounted yet
    },

    applyHelpers(helperTypeList) {
      // an array of helper instances
      let helpers = this._THREEMetaData;

      // do we have helpers for all of the types requested? Add any that are not there
      
    },

    mountComponent() {
      let props = this._currentElement.props;
      THREEObject3DMixin.mountComponent.call(this, rootID, transaction, context);

      // for this component the metadata is a set of helper objects that 'wrap' the child
      this._THREEMetaData = [];
      this.applyHelpers(props.helpers);
    },

    receiveComponent() {
      let newProps = nextElement.props;
      THREEObject3DMixin.receiveComponent.call(this, nextElement, transaction, context);
      this.applyHelpers(newProps.helpers);
    },

    unmountComponent() {
      THREEObject3DMixin.unmountComponent.call(this);
    }
  }
)


