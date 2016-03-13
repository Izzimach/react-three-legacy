
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

import ReactDOM from 'react-dom';

// monkey patch to workaround some assumptions that we're working with the DOM
import monkeypatch from './ReactTHREEMonkeyPatch';
monkeypatch();

import Renderer from './components/THREERenderer';
import Scene from './components/THREEScene';
import PerspectiveCamera from './components/cameras/THREEPerspectiveCamera';
import OrthographicCamera from './components/cameras/THREEOrthographicCamera';
import AxisHelper from './components/objects/THREEAxisHelper';
import Line from './components/objects/THREELine';
import LineSegments from './components/objects/THREELineSegments';
import PointCloud from './components/objects/THREEPointCloud';
import Object3D from './components/objects/THREEObject3D';
import Mesh from './components/objects/THREEMesh';
import SkinnedMesh from './components/objects/THREESkinnedMesh';
import Sprite from './components/objects/THREESprite';
import AmbientLight from './components/lights/THREEAmbientLight';
import PointLight from './components/lights/THREEPointLight';
import AreaLight from './components/lights/THREEAreaLight';
import DirectionalLight from './components/lights/THREEDirectionalLight';
import HemisphereLight from './components/lights/THREEHemisphereLight';
import SpotLight from './components/lights/THREESpotLight';
import Helper from './components/extras/THREEDecoratorHelper';
import Constants from './Constants';

module.exports = {
  Renderer,
  Scene,
  PerspectiveCamera,
  OrthographicCamera,
  AxisHelper,
  Line,
  LineSegments,
  PointCloud,
  Object3D,
  Mesh,
  SkinnedMesh,
  Sprite,
  AmbientLight,
  PointLight,
  AreaLight,
  DirectionalLight,
  HemisphereLight,
  SpotLight,
  Helper,
  Constants,
  render: ReactDOM.render,
  unmountComponentAtNode: ReactDOM.unmountComponentAtNode
};
