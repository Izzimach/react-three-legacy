import { setNewLightColor } from '../Utils';

var LightObjectMixin = {
    applySpecificTHREEProps: function (oldProps, newProps) {
        var THREEObject3D = this._THREEObject3D;
        if ((typeof newProps.color !== 'undefined') &&
            (newProps.color !== oldProps.color))
        {
            setNewLightColor(THREEObject3D.color, newProps.color);
        }
    }
};

export default LightObjectMixin;

