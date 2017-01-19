import * as THREE from 'three';
import { createTHREEComponent } from '../../Utils';
import THREEObject3DMixin from '../../mixins/THREEObject3DMixin';

var THREESprite = createTHREEComponent(
    'Sprite',
    THREEObject3DMixin,
    {
        createTHREEObject: function() {
            return new THREE.Sprite();
        },

        applySpecificTHREEProps: function(oldProps, newProps) {
            this.transferTHREEObject3DPropsByName(oldProps, newProps,
                ['material']);
        }
    }
);

export default THREESprite;
