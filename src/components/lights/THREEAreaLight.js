import * as THREE from 'three';
import { createTHREEComponent } from '../../Utils';
import THREEObject3DMixin from '../../mixins/THREEObject3DMixin';
import LightObjectMixin from '../../mixins/LightObjectMixin';

var THREEAreaLight = createTHREEComponent(
  'AreaLight',
  THREEObject3DMixin,
  {
    createTHREEObject: function() {
      return new THREE.AreaLight(0xffffff, 1);
    },

    applySpecificTHREEProps: function(oldProps, newProps) {
      LightObjectMixin.applySpecificTHREEProps.call(this, oldProps, newProps);

      this.transferTHREEObject3DPropsByName(oldProps, newProps,
                                            ['right',
                                             'normal',
                                             'height',
                                             'width',
                                             'intensity',
                                             'constantAttenuation',
                                             'linearAttenuation',
                                             'quadraticAttenuation']);
    }
  }
);

export default THREEAreaLight;
