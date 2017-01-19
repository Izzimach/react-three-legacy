import * as THREE from 'three';
import { createTHREEComponent } from '../../Utils';
import THREEObject3DMixin from '../../mixins/THREEObject3DMixin';
import LightObjectMixin from '../../mixins/LightObjectMixin';
import transferCommonShadowmapProps from './CommonShadowmapProps';

var THREESpotLight = createTHREEComponent(
    'SpotLight',
    THREEObject3DMixin,
    {
        createTHREEObject: function() {
            return new THREE.SpotLight(0xffffff, 1);
        },

        applySpecificTHREEProps: function(oldProps, newProps) {
            LightObjectMixin.applySpecificTHREEProps.call(this, oldProps, newProps);


            transferCommonShadowmapProps(this._THREEObject3D, newProps);
            this.transferTHREEObject3DPropsByName(oldProps, newProps,
                ['target',
                    'intensity',
                    'distance',
                    'angle',
                    'exponent',
                    'castShadow',
                    'onlyShadow',
                    'shadowCameraFov']);
        }
    }
);

module.exports = THREESpotLight;
