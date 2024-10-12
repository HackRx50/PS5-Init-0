// src/components/charts/RadarChartComponent.jsx
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Typography, Paper } from "@mui/material";

const RadarChartComponent = ({ title, data, dataKey, nameKey, stroke = "#8884d8", fill = "#8884d8", fillOpacity = 0.6 }) => (
  <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
    <Typography variant="h6" gutterBottom>{title}</Typography>
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey={nameKey} />
        <PolarRadiusAxis />
        <Tooltip />
        <Radar name={dataKey} dataKey={dataKey} stroke={stroke} fill={fill} fillOpacity={fillOpacity} />
      </RadarChart>
    </ResponsiveContainer>
  </Paper>
);

export default RadarChartComponent;
