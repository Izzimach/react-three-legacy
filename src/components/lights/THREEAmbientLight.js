import * as THREE from 'three';
import { createTHREEComponent } from '../../Utils';
import THREEObject3DMixin from '../../mixins/THREEObject3DMixin';
import LightObjectMixin from '../../mixins/LightObjectMixin';

var THREEAmbientLight = createTHREEComponent(
  'AmbientLight',
  THREEObject3DMixin,
  {
    createTHREEObject: function() {
      return new THREE.AmbientLight(0x000000);
    },

    applySpecificTHREEProps: function (oldProps, newProps) {
      LightObjectMixin.applySpecificTHREEProps.call(this, oldProps, newProps);
    }
  }
);

export default THREEAmbientLight;
