import * as THREE from 'three';
import assign from 'object-assign';
import warning from 'fbjs/lib/warning';

export function createTHREEComponent(name, ...mixins) {
  let ReactTHREEComponent = function(element) {
    this.node = null;
    this._mountImage = null;
    this._nativeParent = null;
    this._nativeContainerInfo = null;
    this._renderedChildren = null;
    this._THREEObject3D = null;
    this._THREEMetaData = null;
    this._currentElement = element;
  };
  ReactTHREEComponent.displayName = name;

  for (var m of mixins) {
    assign(ReactTHREEComponent.prototype, m);
  }

  return ReactTHREEComponent;
}


export function setNewLightColor(targetColor, sourceValue) {
  // function to set a light color. The sourcevalue
  // can be either a number (usually in hex: 0xff0000)
  // or a THREE.Color

  // is the prop a hex number or a THREE.Color?
  if (typeof sourceValue === 'number') {
    targetColor.setHex(sourceValue);
  } else if (typeof sourceValue === 'object' &&
             sourceValue !== null &&
             sourceValue instanceof THREE.Color) {
    targetColor.copy(sourceValue);
  } else {
    warning(false, "Light color must be a number or an instance of THREE.Color");
  }
}
