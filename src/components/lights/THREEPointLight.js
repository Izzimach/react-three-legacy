import * as THREE from 'three';
import { createTHREEComponent } from '../../Utils';
import THREEObject3DMixin from '../../mixins/THREEObject3DMixin';
import LightObjectMixin from '../../mixins/LightObjectMixin';

var THREEPointLight = createTHREEComponent(
  'PointLight',
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

export default THREEPointLight;
