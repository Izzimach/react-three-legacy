import * as THREE from 'three';
import { createTHREEComponent } from '../../Utils';
import THREEObject3DMixin from '../../mixins/THREEObject3DMixin';

var THREEPerspectiveCamera = createTHREEComponent(
  'PerspectiveCamera',
  THREEObject3DMixin,
  {
    createTHREEObject: function() {
      return new THREE.PerspectiveCamera();
    },

    applySpecificTHREEProps: function(oldProps, newProps) {
      this.transferTHREEObject3DPropsByName(oldProps, newProps,
                                            ['fov','aspect','near','far']);

      this._THREEObject3D.updateProjectionMatrix();
    }
  });

export default THREEPerspectiveCamera;
