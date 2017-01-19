

const shadowPropNames = [
//    'shadowCameraNear', // moved
//    'shadowCameraFar', // moved
    'shadowCameraVisible',
//    'shadowBias', // kmoved
//    'shadowDarkness', // removed
//    'shadowMapWidth', // moved
//    'shadowMapHeight', // moved
    'shadowMap',
//    'shadowMapSize', // moved? did this ever exist?
    'shadowCamera',
    'shadowMatrix'
];

export default function tranferCommonShadowmapProps(THREEObject3D, newProps)
{
  if (typeof THREEObject3D.shadow === 'undefined') {
    // ??? issue a warning?
    return;
  }

  // props that reference inner object values
  if (typeof newProps.shadowBias !== 'undefined') {
    THREEObject3D.shadow.bias = newProps.shadowBias;
  }
  if (typeof newProps.shadowMapWidth !== 'undefined') {
    THREEObject3D.shadow.mapSize.width = newProps.shadowMapWidth;
  }
  if (typeof newProps.shadowMapHeight !== 'undefined') {
    THREEObject3D.shadow.mapSize.height = newProps.shadowMapHeight;
  }
  if (typeof newProps.shadowCameraFar !== 'undefined') {
    THREEObject3D.shadow.camera.far = newProps.shadowCameraFar;
  }
  if (typeof newProps.shadowCameraNear !== 'undefined') {
    THREEObject3D.shadow.camera.near = newProps.shadowCameraNear;
  }
  if (typeof newProps.shadowCameraFov !== 'undefined') {
    THREEObject3D.shadow.camera.fov = newProps.shadowCameraFov;
  }

  // normal props we can transfer by name
  shadowPropNames.forEach(function(propname) {
    if (typeof newProps[propname] !== 'undefined') {
      THREEObject3D[propname] = newProps[propname];
    }
  });
}
