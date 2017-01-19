import * as THREE from 'three';
import { createTHREEComponent } from '../../Utils';
import THREEObject3DMixin from '../../mixins/THREEObject3DMixin';

var THREEPointCloud = createTHREEComponent(
    'PointCloud',
    THREEObject3DMixin,
    {
        createTHREEObject: function() {
            return new THREE.PointCloud(new THREE.Geometry());
        },

        applySpecificTHREEProps: function(oldProps, newProps) {
            this.transferTHREEObject3DPropsByName(oldProps, newProps,
                ['geometry','material','frustumCulled','sortParticles']);
        }
    }

);

export default THREEPointCloud;
