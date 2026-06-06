import mapParchment from './images/map-parchment.png';
import magnifyingGlass from './images/magnifying-glass.png';
import smokingPipe from './images/smoking-pipe.png';

import './SceneDecorations.css';

export default function SceneDecorations() {
  return (
    <div id="scene-decorations" aria-hidden="true">
      <img className="scene-prop scene-prop--map" src={mapParchment} alt="" />
      <img className="scene-prop scene-prop--glass" src={magnifyingGlass} alt="" />
      <img className="scene-prop scene-prop--pipe" src={smokingPipe} alt="" />
    </div>
  );
}
