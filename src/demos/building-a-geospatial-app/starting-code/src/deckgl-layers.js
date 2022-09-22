import React, { Component } from 'react';
import { ScatterplotLayer, HexagonLayer, ArcLayer } from 'deck.gl';

const PICKUP_COLOR = [114, 19, 108];
const DROPOFF_COLOR = [243, 185, 72];
// in RGB

const HEATMAP_COLORS = [
  [255, 255, 204],
  [199, 233, 180],
  [127, 205, 187],
  [65, 182, 196],
  [44, 127, 184],
  [37, 52, 148]
];

const LIGHT_SETTINGS = {
  lightsPosition: [-73.8, 40.5, 8000, -74.2, 40.9, 8000],
  ambientRatio: 0.4,
  diffuseRatio: 0.6,
  specularRatio: 0.2,
  lightsStrength: [0.8, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

const elevationRange = [0, 1000];

export function renderLayers(props) {
  const { data, trip_data, onHover, onHexHover, onArcHover, settings } = props;

  return [
    settings.showArcLayer && new ArcLayer({
      id: 'arc-layer',
      data: trip_data,
      pickable: true,
      getWidth: 12,
      opacity: 0.2,
      getSourcePosition: d => d.pickup_location,
      getTargetPosition: d => d.dropoff_location,
      getSourceColor: d => [255, 140, 0],
      getTargetColor: d => [0, 140, 90],
      onHover: onArcHover
    }),
    settings.showScatterplot && new ScatterplotLayer({
      points: [],
      id: 'scatterplot',
      getPosition: d => d.position,
      getColor: d => d.pickup? PICKUP_COLOR: DROPOFF_COLOR,
      getRadius: d => 3,
      opacity: 0.5,
      pickable: true,
      points: [], 
      radiusMinPixels: 0.125,
      radiusMaxPixels: 30,
      data,
      onHover,
      ...settings
    }),
    settings.showHexagon &&
      new HexagonLayer({
        id: 'heatmap',
        colorRange: HEATMAP_COLORS,
        elevationRange,
        elevationScale: 5,
        extruded: true,
        getPosition: d => d.position,
        lightSettings: LIGHT_SETTINGS,
        opacity: 0.4,
        pickable: true,
        data,
        onHover:onHexHover,
        ...settings
      })
  ];
}
