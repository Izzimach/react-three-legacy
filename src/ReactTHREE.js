
/*
 * Copyright (c) 2014 Gary Haussmann
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//
// Lots of code here is based on react-art: https://github.com/facebook/react-art
//

var ReactDOM = require('react-dom');

// monkey patch to workaround some assumptions that we're working with the DOM
var monkeypatch = require('./ReactTHREEMonkeyPatch');
monkeypatch();

module.exports =  {
    Scene : require('./components/THREEScene'),
    PerspectiveCamera : require('./components/cameras/THREEPerspectiveCamera'),
    OrthographicCamera : require('./components/cameras/THREEOrthographicCamera'),
    AxisHelper : require('./components/objects/THREEAxisHelper'),
    Line : require('./components/objects/THREELine'),
    PointCloud : require('./components/objects/THREEPointCloud'),
    Object3D : require('./components/objects/THREEObject3D'),
    Mesh : require('./components/objects/THREEMesh'),
    SkinnedMesh : require('./components/objects/THREESkinnedMesh'),
    Sprite : require('./components/objects/THREESprite'),
    AmbientLight : require('./components/lights/THREEAmbientLight'),
    PointLight : require('./components/lights/THREEPointLight'),
    AreaLight: require('./components/lights/THREEAreaLight'),
    DirectionalLight: require('./components/lights/THREEDirectionalLight'),
    HemisphereLight: require('./components/lights/THREEHemisphereLight'),
    SpotLight: require('./components/lights/THREESpotLight'),
    Constants: require('./Constants'),
    render: ReactDOM.render
};
