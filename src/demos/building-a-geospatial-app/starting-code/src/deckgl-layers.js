import React, { Component } from 'react';
import { ScatterplotLayer } from 'deck.gl';

const PICKUP_COLOR = [114, 19, 108];
const DROPOFF_COLOR = [243, 185, 72];

export function renderLayers(props) {
  const { data, onHover, settings } = props;
  return [
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
    })
  ];
}
