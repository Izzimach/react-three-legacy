import * as THREE from 'three';
import { createTHREEComponent } from '../../Utils';
import THREEObject3DMixin from '../../mixins/THREEObject3DMixin';

var THREELine = createTHREEComponent(
    'Line',
    THREEObject3DMixin,
    {
        createTHREEObject: function() {
            return new THREE.Line();
        },

        applySpecificTHREEProps: function(oldProps, newProps) {
            this.transferTHREEObject3DPropsByName(oldProps,newProps,
                ['geometry','material','mode']);
        }
    }
);

export default THREELine;
