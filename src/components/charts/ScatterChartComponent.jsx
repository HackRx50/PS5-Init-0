// src/components/charts/ScatterChartComponent.jsx
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Typography, Paper } from "@mui/material";

const ScatterChartComponent = ({ title, data, xKey, yKey, fill = "#8884d8" }) => (
  <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
    <Typography variant="h6" gutterBottom>{title}</Typography>
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <XAxis type="number" dataKey={xKey} name={xKey} />
        <YAxis type="number" dataKey={yKey} name={yKey} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="Cases" data={data} fill={fill} />
      </ScatterChart>
    </ResponsiveContainer>
  </Paper>
);

export default ScatterChartComponent;
