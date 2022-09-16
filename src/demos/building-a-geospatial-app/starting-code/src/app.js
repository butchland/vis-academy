import React, { Component } from 'react';
import { StaticMap, NavigationControl } from 'react-map-gl';
import {
  LayerControls,
  MapStylePicker,
  HEXAGON_CONTROLS
} from './controls';
import DeckGL from 'deck.gl';
import taxiData from '../../../data/taxi';
import { renderLayers } from './deckgl-layers';
import { tooltipStyle } from './style';

const MAPBOX_STYLE = 'mapbox://styles/mapbox/dark-v9';
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  longitude: -74,
  latitude: 40.7,
  zoom: 11,
  minZoom: 5,
  maxZoom: 22,
  pitch: 30,
  bearing: 0
}

export default class App extends Component {
  state = {
    hover: {
      x: 0,
      y: 0,
      hoveredObject: null
    },
    hexhover: {
      x: 0,
      y: 0,
      hoveredObject: null
    },
    points: [],
    settings: Object.keys(HEXAGON_CONTROLS).reduce(
      (accu, key) => ({
        ...accu,
        [key]: HEXAGON_CONTROLS[key].value
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

  _onWebGLInitialize = gl => {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  };

  _processData() {
    const points = taxiData.reduce((accu, curr, i) => {
     
      accu.push({
        position: [Number(curr.pickup_longitude), Number(curr.pickup_latitude)],
        trip_id: i,
        event_datetime: curr.pickup_datetime,
        passenger_count: curr.passenger_count,
        trip_distance: curr.trip_distance,
        fare_amount: curr.fare_amount,
        tip_amount: curr.tip_amount,
        total_amount: curr.total_amount,
        pickup: true
      });
      accu.push({
        position: [
          Number(curr.dropoff_longitude),
          Number(curr.dropoff_latitude)
        ],
        trip_id: i,
        event_datetime: curr.dropoff_datetime,
        passenger_count: curr.passenger_count,
        trip_distance: curr.trip_distance,
        fare_amount: curr.fare_amount,
        tip_amount: curr.tip_amount,
        total_amount: curr.total_amount,
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

  _onHover({ x, y, object }) {
    const label = object ? (object.pickup ? 'Pickup' : 'Dropoff') : null;

    this.setState({ hover: { x, y, hoveredObject: object, label } });
  }
  _onHexHover({ x, y, object }) {
    if (object) {
      const points = object.points;
      const trips = points.length;
      this.setState({ hexhover: { x, y, hoveredObject: object, trips} });
    }
  }
  render() {
    const data = this.state.points;
    if (!data.length) {
      return null;
    }
    const { hover, hexhover } = this.state;
    return (
      <div>
        {hover.hoveredObject && (
          <div
            style={{
              ...tooltipStyle,
              transform: `translate(${hover.x}px, ${hover.y}px)`
            }}
          >
            <div>{hover.label} {hover.hoveredObject.trip_id} </div>
            <div>{hover.hoveredObject.event_datetime} pass: {hover.hoveredObject.passenger_count} </div>
            <div>dist: {hover.hoveredObject.trip_id} fare: {hover.hoveredObject.fare_amount}</div>
            <div>tip: {hover.hoveredObject.tip_amount} tot: {hover.hoveredObject.total_amount} </div>
          </div>
        )}
        {hexhover.hoveredObject && (
          <div
            style={{
              ...tooltipStyle,
              transform: `translate(${hexhover.x}px, ${hexhover.y}px)`
            }}
          >            
          <div>total trips {hexhover.trips}</div>
          </div>
        )}
        <DeckGL
          layers={renderLayers({
            data: this.state.points,
            onHover: hover => this._onHover(hover),
            onHexHover: hover => this._onHexHover(hover),
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
            propTypes={HEXAGON_CONTROLS}
            onChange={settings => this._updateLayerSettings(settings)}
          />
          <StaticMap
            mapStyle={this.state.style}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          >
            <div className='mapboxgl-ctrl-bottom-right'>
              <NavigationControl 
                onViewportChange={viewport => this.setState({viewport})}
                visualizePitch={true}
                showCompass={true}
                showZoom={true}
              />
            </div>
          </StaticMap>
        </DeckGL>
      </div>
    );
  }
}
