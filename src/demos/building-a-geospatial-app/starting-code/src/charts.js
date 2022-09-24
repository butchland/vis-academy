import React from "react";
import { charts } from "./style";

import { VerticalBarSeries, XAxis, XYPlot, YAxis } from "react-vis";

export default function Charts({ pickups }) {

  if (!pickups) {
    return <div style={charts} />;
  }

  return (
    <div style={charts}>
      <h2>Pickups by hour</h2>
      <p>As percentage of all trips</p>
      <XYPlot height={140} width={480}>
        <XAxis />
        <YAxis tickFormat={d => (d / 100).toFixed(0) + '%'} />
        <VerticalBarSeries data={pickups} />
      </XYPlot>
    </div>
  );
}
