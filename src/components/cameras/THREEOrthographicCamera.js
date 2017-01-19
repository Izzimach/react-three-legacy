import * as THREE from 'three';
import { createTHREEComponent } from '../../Utils';
import THREEObject3DMixin from '../../mixins/THREEObject3DMixin';

var THREEOrthographicCamera = createTHREEComponent(
  'OrthographicCamera',
  THREEObject3DMixin,
  {
    createTHREEObject: function() {
      return new THREE.OrthographicCamera();
    },

    applySpecificTHREEProps: function(oldProps, newProps) {
      this.transferTHREEObject3DPropsByName(oldProps, newProps,
                                            ['left','right','top','bottom','near','far']);

      this._THREEObject3D.updateProjectionMatrix();
    }
  }
);

export default THREEOrthographicCamera;
