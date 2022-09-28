import React from "react";
import { charts } from "./style";

import { VerticalBarSeries, XAxis, XYPlot, YAxis } from "react-vis";

export default function Charts({ 
  highlight,
  highlightedHour,
  select,
  selectedHour,
  pickups, 
  taxi_trips
 }) {

  if (!pickups) {
    return <div style={charts} />;
  }
  const total_trips = taxi_trips.length;
  const data = pickups.map(d => {
    let color = '#125C77';
    if (d.hour === selectedHour) {
      color =  '#19CDD7';
    }
    if (d.hour === highlightedHour) {
      color =  '#17B8BE';
    } 
    return { ...d, color }
  });

  return (
    <div style={charts}>
      <h2>Pickups by hour</h2>
      <p>As percentage of all trips ({total_trips})</p>
      <XYPlot 
        height={140} 
        width={480} 
        yDomain={[0,total_trips/10]}
        onMouseLeave={() => highlight(null)}
      >
        <XAxis />
        <YAxis tickFormat={d => (d / 100).toFixed(0) + '%'} />
        <VerticalBarSeries 
          colorType="literal"
          data={data} 
          onValueMouseOver={d => highlight(d.hour)}
          onValueClick={d => select(d.hour)}
          style={{cursor: 'pointer'}}
        />
      </XYPlot>
    </div>
  );
}
