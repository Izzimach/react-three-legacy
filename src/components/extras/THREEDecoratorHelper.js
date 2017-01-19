import * as THREE from 'three';
import { createTHREEComponent } from '../../Utils';
import THREEObject3DMixin from '../../mixins/THREEObject3DMixin';
import _ from 'lodash';

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

    applyHelpers(newHelperTypes) {
      // an array of helper instances
      let currentHelpers = this._THREEMetaData;

      // The actual threejs nodes. The immediate child is wrapped by helpers, and helpers
      // get put in the base object for this component.
      let helperContainerNode = this._THREEObject3D;
      let helperWrapNode = helperContainerNode.children[0];

      // figure out which helpers to add and remove
      let helperAddTypeList = _.differenceWith(newHelperTypes, currentHelpers, (a,b) => b instanceof a);
      let helperRemoveList = _.differenceWith(currentHelpers, newHelperTypes, (a,b) => a instanceof b);

      for (let newHelperType of helperAddTypeList) {
        let newHelper = new newHelperType(helperWrapNode);
        currentHelpers.push(newHelper);
        helperContainerNode.children.push(newHelper);
      }

      for (let removeHelper of helperRemoveList) {
        _.remove(currentHelpers, removeHelper);
        _.remove(helperContainerNode.children, removeHelper);
      }
    },

    mountComponent(rootID, transaction, context) {
      let props = this._currentElement.props;
      THREEObject3DMixin.mountComponent.call(this, rootID, transaction, context);

      // for this component the metadata is a set of helper objects that 'wrap' the child
      this._THREEMetaData = [];

      let helpers = props.helpers || [];
      this.applyHelpers(helpers);

      return this._THREEObject3D;
    },

    receiveComponent(nextElement, transaction, context) {
      let newProps = nextElement.props;
      THREEObject3DMixin.receiveComponent.call(this, nextElement, transaction, context);
      this.applyHelpers(newProps.helpers);

      // call update methods where they exist on the helpers
      let currentHelpers = this._THREEMetaData;
      let helperContainerNode = this._THREEObject3D;
      let helperWrapNode = helperContainerNode.children[0];
      for (let helper of currentHelpers) {
        if (helper.update) {
          helper.update(helperWrapNode);
        }
      }
    },

    unmountComponent() {
      this.applyHelpers([]); // should remove all helpers
      THREEObject3DMixin.unmountComponent.call(this);
    }
  }
);
