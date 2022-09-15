import React, { Component } from 'react';
import { StaticMap } from 'react-map-gl';
import { MapStylePicker } from './controls';
import DeckGL from 'deck.gl';
import taxiData from '../../../data/taxi';
import { renderLayers } from './deckgl-layers';

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
    points: [],
    style: MAPBOX_STYLE
  };
  
  onStyleChange = (style) => {
    this.setState({ style });
  }

  componentDidMount() {
    this._processData();
    // ...
  }

  _processData() {
    const points = taxiData.reduce((accu, curr) => {
      accu.push({
        position: [Number(curr.pickup_longitude), Number(curr.pickup_latitude)],
        pickup: true
      });
      accu.push({
        position: [
          Number(curr.dropoff_longitude),
          Number(curr.dropoff_latitude)
        ],
        pickup: false
      });
      return accu;
    }, []);
    this.setState({
      points
    });
  }


  render() {
    return (
      <div>
        <DeckGL
          layers={renderLayers({data: this.state.points})} 
          initialViewState={INITIAL_VIEW_STATE} 
          controller
        >
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
