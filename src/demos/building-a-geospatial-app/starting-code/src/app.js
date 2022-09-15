import React, { Component } from 'react';
import { StaticMap } from 'react-map-gl';
import { MapStylePicker } from './controls';
import DeckGL from 'deck.gl';

const MAPBOX_STYLE = 'mapbox://styles/mapbox/dark-v9';
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  longitude: -74,
  latitude: 40.7,
  zoom: 11,
  minZoom: 5,
  maxZoom: 22,
  pitch: 0,
  bearing: 0
}

export default class App extends Component {
  state = {
    style: MAPBOX_STYLE
  };
  
  onStyleChange = (style) => {
    this.setState({ style });
  }
 
  render() {
    return (
      <div>
        <DeckGL initialViewState={INITIAL_VIEW_STATE} controller>
          <MapStylePicker 
            onStyleChange={this.onStyleChange} 
            currentStyle={this.state.style} 
          />
          <StaticMap 
            mapStyle={this.state.style} 
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        </DeckGL>
      </div>
    );
  }
}
