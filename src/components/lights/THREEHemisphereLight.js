import * as THREE from 'three';
import {createTHREEComponent, setNewLightColor} from '../../Utils';
import THREEObject3DMixin from '../../mixins/THREEObject3DMixin';
import LightObjectMixin from '../../mixins/LightObjectMixin';

var THREEHemisphereLight = createTHREEComponent(
  'HemisphereLight',
  THREEObject3DMixin,
  {
    createTHREEObject: function() {
      return new THREE.HemisphereLight(0x8888ff, 0x000000, 1);
    },

    applySpecificTHREEProps: function(oldProps, newProps) {
      LightObjectMixin.applySpecificTHREEProps.call(this, oldProps, newProps);

      // sky color gets mapped to 'color'
      if (typeof newProps.skyColor !== 'undefined') {
        setNewLightColor(this._THREEObject3D.color, newProps.skyColor);
      }

      this.transferTHREEObject3DPropsByName(oldProps, newProps,
                                            ['groundColor',
                                             'intensity']);
    }
  }
);

export default THREEHemisphereLight;
