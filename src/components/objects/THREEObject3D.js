import { createTHREEComponent } from '../../Utils';
import THREEObject3DMixin from '../../mixins/THREEObject3DMixin';

var THREEObject3D = createTHREEComponent(
    'Object3D',
    THREEObject3DMixin);

export default THREEObject3D;
