import React, { Component } from 'react';
import MapGL from 'react-map-gl';
import { MapStylePicker } from './controls';

const MAPBOX_STYLE = 'mapbox://styles/mapbox/dark-v9';
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      style: MAPBOX_STYLE,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        longitude: -74,
        latitude: 40.7,
        zoom: 11,
        maxZoom: 22
      }

    };
  }
  onStyleChange = (style) => {
    this.setState({ style });
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: { ...this.state.viewport, ...viewport }
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize);
    this._resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resize);
  }

  _resize = () => {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  render() {
    return (
      <div>
        <MapStylePicker onStyleChange={this.onStyleChange} currentStyle={this.state.style} />
        <MapGL
          {... this.state.viewport}
          mapStyle={this.state.style}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          onViewportChange={viewport => this._onViewportChange(viewport)}
        >
        </MapGL>
      </div>
    );
  }
}
