// src/components/charts/HeatmapComponent.jsx
import React from 'react';
import HeatMapGrid from 'react-heatmap-grid';
import { Typography, Paper } from "@mui/material";

const HeatmapComponent = ({ title, data, xLabels, yLabels, getColor }) => (
  <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
    <Typography variant="h6" gutterBottom>{title}</Typography>
    <HeatMapGrid
      data={data}
      xLabels={xLabels}
      yLabels={yLabels}
      cellStyle={(background, value, min, max, data, x, y) => ({
        background: getColor(value),
        fontSize: "11px",
        color: "#444",
      })}
      cellRender={value => value && `${value}`}
    />
  </Paper>
);

export default HeatmapComponent;
