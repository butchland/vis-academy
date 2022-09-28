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
import Charts from './charts';

const MAPBOX_STYLE = 'mapbox://styles/mapbox/dark-v9';
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
const MSECS_PER_DAY = 1000 * 60 * 60 * 24;
const TZ_ADJUST = (new Date()).getTimezoneOffset() * 60 * 1000;

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
      hoveredObject: null,
      label: ''
    },
    hexhover: {
      x: 0,
      y: 0,
      hoveredObject: null,
      trips: 0,
      points: [],
    },
    archover: {
      x: 0,
      y: 0,
      hoveredObject: null
    },
    highlightedHour: null,
    selectedHour: null,
    points: [],
    pickups: [],
    dropoffs: [],
    taxi_trips: [],
    max_distance: 0,
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
    
    const taxi_trips = taxiData.map((curr,i) => {
      const taxi_trip = {
        trip_id: i,
        pickup_location: [Number(curr.pickup_longitude),Number(curr.pickup_latitude)],
        dropoff_location: [Number(curr.dropoff_longitude), Number(curr.dropoff_latitude)],
        pickup_time: (new Date(curr.pickup_datetime)).getTime()  % MSECS_PER_DAY,
        dropoff_time: (new Date(curr.dropoff_datetime)).getTime()  % MSECS_PER_DAY,
        ...curr
      }
      return taxi_trip;
    });
    const max_distance = Math.max(...taxi_trips.map(d => d.trip_distance));

    const data = taxiData.reduce((accu, curr, i) => {
      const pickupHour = new Date(curr.pickup_datetime).getUTCHours();
      const dropoffHour = new Date(curr.dropoff_datetime).getUTCHours();
     
      accu.points.push({
        position: [Number(curr.pickup_longitude), Number(curr.pickup_latitude)],
        trip_id: i,
        event_datetime: curr.pickup_datetime,
        event_time: (new Date(curr.pickup_datetime)).getTime()  % MSECS_PER_DAY,
        passenger_count: curr.passenger_count,
        trip_distance: curr.trip_distance,
        fare_amount: curr.fare_amount,
        tip_amount: curr.tip_amount,
        total_amount: curr.total_amount,
        hour: pickupHour,
        pickup: true
      });
      accu.points.push({
        position: [
          Number(curr.dropoff_longitude),
          Number(curr.dropoff_latitude)
        ],
        trip_id: i,
        event_datetime: curr.dropoff_datetime,
        event_time: (new Date(curr.pickup_datetime)).getTime()  % MSECS_PER_DAY,
        passenger_count: curr.passenger_count,
        trip_distance: curr.trip_distance,
        fare_amount: curr.fare_amount,
        tip_amount: curr.tip_amount,
        total_amount: curr.total_amount,
        hour: dropoffHour,
        pickup: false
      });
      const prevPickups = accu.pickupObj[pickupHour] || 0;
      const prevDropoffs = accu.dropoffObj[dropoffHour] || 0;
      accu.pickupObj[pickupHour] = prevPickups + 1;
      accu.dropoffObj[dropoffHour] = prevDropoffs + 1;

      return accu;
    },{ 
        points:[],
        pickupObj: {},
        dropoffObj: {}
      });

    data.pickups = Object.entries(data.pickupObj).map(([hour, count]) => {
      return { hour: Number(hour), x: Number(hour) + 0.5, y: count };
    });
    data.dropoffs = Object.entries(data.dropoffObj).map(([hour, count]) => {
      return { hour: Number(hour), x: Number(hour) + 0.5, y: count };
    });
  
    
    this.setState({
      points: data.points,
      pickups: data.pickups,
      dropoffs: data.dropoffs,
      taxi_trips,
      max_distance
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
      this.setState({ hexhover: { x, y, hoveredObject: object, trips, points} });
    }
  }
  _onArcHover({ x, y, object }) {
    if (object) {      
      this.setState({ archover: { x, y, hoveredObject: object} });
    }
  }
  _onHighlight(highlightedHour) {
    this.setState({highlightedHour});
  }
  _onSelect(selectedHour) {
    this.setState({
      selectedHour: selectedHour === this.state.selectedHour ? null : selectedHour
    });
  }
  render() {
    const distanceUpperPercentile  = this.state.settings.distanceUpperPercentile;
    const distanceLowerPercentile  = this.state.settings.distanceLowerPercentile;
    const max_distance = this.state.max_distance;
    const upper_distance_threshold = max_distance * distanceUpperPercentile/100;
    const lower_distance_threshold = max_distance * distanceLowerPercentile/100;
    const timeUpperPercentile = this.state.settings.timeUpperPercentile;
    const timeLowerPercentile = this.state.settings.timeLowerPercentile;
    const upper_time_threshold = MSECS_PER_DAY * timeUpperPercentile/100;
    const lower_time_threshold = MSECS_PER_DAY * timeLowerPercentile/100;
    const limitTime = this.state.settings.limitTime;

    const taxi_trips = this.state.taxi_trips.filter(
      d => (d.trip_distance > upper_distance_threshold && d.trip_distance < lower_distance_threshold) &&
           (!limitTime || (d.pickup_time > upper_time_threshold && d.pickup_time < lower_time_threshold))
    );
    const limitScatterplot = this.state.settings.limitScatterplot;
    const showPickups = this.state.settings.showPickups;
    const showDropoffs = this.state.settings.showDropoffs;

    const data = this.state.points.filter(d => (!limitScatterplot ||(
      (d.trip_distance > upper_distance_threshold && d.trip_distance < lower_distance_threshold)) && 
      (d.event_time > upper_time_threshold && d.event_time < lower_time_threshold)) && 
      ((showPickups && d.pickup) || (showDropoffs && !d.pickup)));
    // if (!data.length) {
    //   return null;
    // }

    const { hover, hexhover, archover } = this.state;
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
            <div>dist: {hover.hoveredObject.trip_distance} fare: {hover.hoveredObject.fare_amount}</div>
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
        {archover.hoveredObject && (
          <div
            style={{
              ...tooltipStyle,
              transform: `translate(${archover.x}px, ${archover.y}px)`
            }}
          >            
            <div>trip distance {archover.hoveredObject.trip_distance}</div>
            <div>time: {(new Date(archover.hoveredObject.pickup_time + TZ_ADJUST)).toLocaleTimeString()}</div>
          </div>
        )}
        <MapStylePicker
          onStyleChange={this.onStyleChange}
          currentStyle={this.state.style}
        />
        <LayerControls
          settings={this.state.settings}
          propTypes={HEXAGON_CONTROLS}
          onChange={settings => this._updateLayerSettings(settings)}
        />

        <DeckGL
          {... this.state.settings}
          onWebGLInitialize={this._onWebGLInitialize}
          layers={renderLayers({
            data,
            trip_data: taxi_trips,
            onHover: hover => this._onHover(hover),
            onHexHover: hover => this._onHexHover(hover),
            onArcHover: hover => this._onArcHover(hover),
            settings: this.state.settings
          })}
          initialViewState={INITIAL_VIEW_STATE}
          controller
        >
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
        <Charts  {...this.state}
                 highlight={ hour => this._onHighlight(hour) }  
                 select={ hour => this._onSelect(hour)}
        />
      </div>
    );
  }
}
