// src/components/charts/ChoroplethMap.jsx
import React from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleQuantize } from 'd3-scale';
import { Typography, Paper } from "@mui/material";

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/india/maharashtra-pune.json"; // Example GeoJSON

const ChoroplethMap = ({ title, data, dataKey }) => {
  // Create a scale for coloring
  const colorScale = scaleQuantize()
    .domain([0, Math.max(...data.map(d => d.value))])
    .range([
      "#f7fbff",
      "#deebf7",
      "#c6dbef",
      "#9ecae1",
      "#6baed6",
      "#4292c6",
      "#2171b5",
      "#08519c",
      "#08306b"
    ]);

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <ComposableMap projection="geoMercator" projectionConfig={{ scale: 1000 }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map(geo => {
              const districtName = geo.properties.NAME_2; // Adjust based on GeoJSON
              const districtData = data.find(d => d.name === districtName);
              const value = districtData ? districtData.value : 0;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={colorScale(value)}
                  stroke="#FFF"
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </Paper>
  );
};

export default ChoroplethMap;
