import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter
} from 'recharts';
import { Box, Typography, Grid, Paper } from "@mui/material";
import caseData from "../../data/data.json";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const processedData = caseData.map(item => {
      const filingDate = new Date(item.filing_date);
      const decisionDate = item.decision_date ? new Date(item.decision_date) : null;
  
      // Check if filingDate is valid
      if (isNaN(filingDate)) {
        console.warn(`Invalid filing_date for item ID ${item.id}:`, item.filing_date);
        return null; // Exclude this item or handle it as needed
      }
  
      // Check if decisionDate is valid (if it exists)
      if (item.decision_date && isNaN(decisionDate)) {
        console.warn(`Invalid decision_date for item ID ${item.id}:`, item.decision_date);
        return null; // Exclude this item or handle it as needed
      }
  
      return {
        ...item,
        filingDate,
        disposalDuration: decisionDate ? 
          (decisionDate - filingDate) / (1000 * 60 * 60 * 24) : null
      };
    }).filter(item => item !== null); // Remove invalid items
  
    setData(processedData);
  }, []);
  

  const countOccurrences = (arr, key) => {
    return arr.reduce((acc, curr) => {
      const value = curr[key];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  };

  const prepareChartData = (dataObj) => {
    return Object.entries(dataObj).map(([name, value]) => ({ name, value }));
  };

  const casesByYear = countOccurrences(data, 'Year');
  const casesByType = countOccurrences(data, 'case_type');
  const casesByDisposal = countOccurrences(data, 'Nature_of_Disposal');

  const monthlyFilings = data.reduce((acc, curr) => {
    const monthYear = curr.filingDate.toISOString().slice(0, 7);
    acc[monthYear] = (acc[monthYear] || 0) + 1;
    return acc;
  }, {});

  const disposedCases = data.filter(item => item.Nature_of_Disposal !== "").length;
  const pendingCases = data.length - disposedCases;

  const hearingVsDisposalTime = data
    .filter(item => item.disposalDuration !== null)
    .map(item => ({
      hearings: item.hearing_count,
      disposalTime: item.disposalDuration
    }));

  const ChartWrapper = ({ title, children }) => (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <ResponsiveContainer width="100%" height={300}>
        {children}
      </ResponsiveContainer>
    </Paper>
  );

  return (
    <Box m={3}>
      <Typography variant="h4" gutterBottom>Judiciary Data Analytics Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ChartWrapper title="Cases Filed by Year">
            <BarChart data={prepareChartData(casesByYear)}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ChartWrapper>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartWrapper title="Monthly Case Filings Trend">
            <LineChart data={prepareChartData(monthlyFilings)}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#82ca9d" />
            </LineChart>
          </ChartWrapper>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartWrapper title="Case Types Distribution">
            <PieChart>
              <Pie
                data={prepareChartData(casesByType)}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {prepareChartData(casesByType).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ChartWrapper>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartWrapper title="Nature of Disposal">
            <BarChart data={prepareChartData(casesByDisposal)}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ChartWrapper>
        </Grid>
        <Grid item xs={12}>
          <ChartWrapper title="Hearing Count vs Disposal Time">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis type="number" dataKey="hearings" name="Hearing Count" />
              <YAxis type="number" dataKey="disposalTime" name="Disposal Time (days)" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Cases" data={hearingVsDisposalTime} fill="#8884d8" />
            </ScatterChart>
          </ChartWrapper>
        </Grid>
      </Grid>
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Cases</Typography>
            <Typography variant="h4">{data.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Disposed Cases</Typography>
            <Typography variant="h4">{disposedCases}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Pending Cases</Typography>
            <Typography variant="h4">{pendingCases}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Avg Hearing Count</Typography>
            <Typography variant="h4">{(data.reduce((sum, item) => sum + item.hearing_count, 0) / data.length).toFixed(2)}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;