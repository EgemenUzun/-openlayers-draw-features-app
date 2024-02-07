import Map from 'ol/Map.js';
import View from 'ol/View.js';
import olGeomCircle from 'ol/geom/Circle.js';
import { fromCircle, makeRegular } from 'ol/geom/Polygon.js';
import Draw from 'ol/interaction/Draw.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';

const raster = new TileLayer({
  source: new OSM(),
});

const source = new VectorSource({ wrapX: false });

const vector = new VectorLayer({
  source: source,
});

const map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [-11000000, 4600000],
    zoom: 4,
  }),
});
const typeSelect = document.getElementById('type');

let draw; // global so we can remove it later
function addInteraction() {
  let value = typeSelect.value;
  if (value !== 'None') {
    if (value === 'Square') {
      
      draw = new Draw({
        source:source,
        type: 'Circle',
        geometryFunction: square()
      })
    }
     else if(value === 'Circle') {
      
      draw = new Draw({
        source:source,
        type: 'Circle',
        geometryFunction: circle()
      })
    }
    else {
      draw = new Draw({
        source: source,
        type: value,
      });
    }
    map.addInteraction(draw);
  }
}

/**
 * Handle change event.
 */
typeSelect.onchange = function () {
  map.removeInteraction(draw);
  addInteraction();
};

document.getElementById('undo').addEventListener('click', function () {
  draw.removeLastPoint();
});

addInteraction();

function circle() {
  return function (coordinates, geometry) {
    const center = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    const dx = center[0] - last[0];
    const dy = center[1] - last[1];
    const maxRadius = 55000;
    const radius = Math.min(Math.sqrt(dx * dx + dy * dy), maxRadius);
    geometry = new olGeomCircle(center, 15000);
    return geometry;
  }
}

function square(angle){

  return function (coordinates, geometry, projection) {
    const center = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    geometry = geometry || fromCircle(new olGeomCircle(center, 50000/ Math.sqrt(2)), 4);

    let internalAngle = angle;
    if (!angle && angle !== 0) {
      const x = last[0] - center[0];
      const y = last[1] - center[1];
      internalAngle = Math.atan2(y, x);
    }
    makeRegular(
      geometry,
      center,
      50000/ Math.sqrt(2),
      internalAngle
    );

    return geometry;
  }
}