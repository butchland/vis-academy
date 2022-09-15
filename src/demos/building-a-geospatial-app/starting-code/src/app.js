import React, { Component } from 'react';
import { StaticMap } from 'react-map-gl';
import {
  LayerControls,
  MapStylePicker,
  SCATTERPLOT_CONTROLS
} from './controls';
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
    settings: Object.keys(SCATTERPLOT_CONTROLS).reduce(
      (accu, key) => ({
        ...accu,
        [key]: SCATTERPLOT_CONTROLS[key].value
      }),
      {}
    ),
    style: MAPBOX_STYLE
  };

  onStyleChange = (style) => {
    this.setState({ style });
  }

  componentDidMount() {
    this._processData();
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

  _updateLayerSettings(settings) {
    this.setState({ settings });
  }

  render() {
    return (
      <div>
        <DeckGL
          layers={renderLayers({ 
            data: this.state.points,
            settings: this.state.settings
          })}
          initialViewState={INITIAL_VIEW_STATE}
          controller
        >
          <MapStylePicker
            onStyleChange={this.onStyleChange}
            currentStyle={this.state.style}
          />
        <LayerControls
          settings={this.state.settings}
          propTypes={SCATTERPLOT_CONTROLS}
          onChange={settings => this._updateLayerSettings(settings)}
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
