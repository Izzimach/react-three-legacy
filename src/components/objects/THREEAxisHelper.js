import * as THREE from 'three';
import { createTHREEComponent } from '../../Utils';
import THREEObject3DMixin from '../../mixins/THREEObject3DMixin';

export default createTHREEComponent(
    'AxisHelper',
    THREEObject3DMixin,
    {
        createTHREEObject: function() {
            return new THREE.AxisHelper(this._currentElement.props.size || 5);
        }
    }
);
