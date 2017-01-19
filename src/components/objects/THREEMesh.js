import * as THREE from 'three';
import { createTHREEComponent } from '../../Utils';
import THREEObject3DMixin from '../../mixins/THREEObject3DMixin';

var THREEMesh = createTHREEComponent(
    'Mesh',
    THREEObject3DMixin,
    {
        createTHREEObject: function() {
            return new THREE.Mesh(new THREE.Geometry(), new THREE.Material()); // starts out empty
        },

        applySpecificTHREEProps: function (oldProps, newProps) {
            var THREEObject3D = this._THREEObject3D;
            if ((typeof newProps.geometry !== 'undefined') &&
                (newProps.geometry !== oldProps.geometry))
            {
                THREEObject3D.geometry = newProps.geometry;
            }

            if ((typeof newProps.material !== 'undefined') &&
                (newProps.material !== oldProps.material))
            {
                THREEObject3D.material = newProps.material;
            }

        }
    }
);

export default THREEMesh;
