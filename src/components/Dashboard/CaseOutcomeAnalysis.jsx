// src/components/Dashboard/CaseOutcomeAnalysis.jsx
import React, { useEffect, useState } from 'react';
import { Grid } from "@mui/material";
import BarChartComponent from '../charts/BarChartComponent';
import PieChartComponent from '../charts/PieChartComponent';
import RadarChartComponent from '../charts/RadarChartComponent';
import LineChartComponent from '../charts/LineChartComponent';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import caseData from "../../data/data.json";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const CaseOutcomeAnalysis = () => {
  const [chartsData, setChartsData] = useState({});

  useEffect(() => {
    const processedData = caseData.map(item => ({
      ...item,
      filingDate: new Date(item.filing_date),
      decisionDate: item.decision_date ? new Date(item.decision_date) : null,
      disposalDuration: item.decision_date ? 
        (new Date(item.decision_date) - new Date(item.filing_date)) / (1000 * 60 * 60 * 24) : null
    })).filter(item => !isNaN(item.filingDate));

    const countOccurrences = (arr, key) => {
      return arr.reduce((acc, curr) => {
        const value = curr[key] || 'Unknown';
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {});
    };

    const prepareChartData = (dataObj) => {
      return Object.entries(dataObj).map(([name, value]) => ({ name, value }));
    };

    // Total disposed cases
    const disposedCases = processedData.filter(item => item.Nature_of_Disposal !== "").length;

    // Disposed vs. pending
    const disposed = disposedCases;
    const pending = processedData.length - disposed;

    // Disposition by case type
    const dispositionByType = processedData.reduce((acc, curr) => {
      const type = curr.case_type || 'Unknown';
      const disposition = curr.Nature_of_Disposal || 'Unknown';
      if (!acc[type]) acc[type] = {};
      acc[type][disposition] = (acc[type][disposition] || 0) + 1;
      return acc;
    }, {});

    const stackedData = Object.entries(dispositionByType).map(([type, dispositions]) => {
      return { type, ...dispositions };
    });

    // Case disposal by method
    const disposalByMethod = countOccurrences(processedData, 'Nature_of_Disposal');

    // Average time to disposal by method
    const disposalDurationByMethod = processedData.reduce((acc, curr) => {
      const method = curr.Nature_of_Disposal || 'Unknown';
      if (curr.disposalDuration !== null) {
        if (!acc[method]) {
          acc[method] = { total: 0, count: 0 };
        }
        acc[method].total += curr.disposalDuration;
        acc[method].count += 1;
      }
      return acc;
    }, {});

    const avgDisposalByMethod = Object.entries(disposalDurationByMethod).map(([method, { total, count }]) => ({
      method,
      averageDisposalTime: parseFloat((total / count).toFixed(2)),
    }));

    // Case status breakdown (assuming 'Contested/Uncontested' indicates status)
    const caseStatus = countOccurrences(processedData, 'Contested/Uncontested');

    // Withdrawn vs. settled cases
    // Assuming you have a 'status' field indicating 'withdrawn' or 'settled'
    const withdrawn = processedData.filter(item => item.status === 'withdrawn').length;
    const settled = processedData.filter(item => item.status === 'settled').length;

    // Cases disposed in Lok Adalat
    const lokAdalatCases = processedData.filter(item => item.Nature_of_Disposal.includes('Lok Adalat')).length;

    // Monthly case disposal trend
    const monthlyDisposals = processedData.reduce((acc, curr) => {
      if (curr.decisionDate) {
        const monthYear = curr.decisionDate.toISOString().slice(0, 7);
        acc[monthYear] = (acc[monthYear] || 0) + 1;
      }
      return acc;
    }, {});

    // Average time to case disposal
    const totalDisposalTime = processedData.reduce((acc, curr) => acc + (curr.disposalDuration || 0), 0);
    const avgDisposalTime = (totalDisposalTime / processedData.length).toFixed(2);

    setChartsData({
      disposed,
      pending,
      stackedData,
      disposalByMethod: prepareChartData(disposalByMethod),
      avgDisposalByMethod,
      caseStatus: prepareChartData(caseStatus),
      withdrawn,
      settled,
      lokAdalatCases,
      monthlyDisposals: prepareChartData(monthlyDisposals),
      avgDisposalTime,
    });
  }, []);

  return (
    <Grid container spacing={3}>
      {/* Total disposed cases */}
      <Grid item xs={12} md={6}>
        <BarChartComponent 
          title="Total Disposed Cases" 
          data={[{ name: 'Disposed', value: chartsData.disposed }]} 
          dataKey="value" 
          fill="#8884d8" 
        />
      </Grid>

      {/* Disposed vs. pending cases */}
      <Grid item xs={12} md={6}>
        <PieChartComponent 
          title="Disposed vs Pending Cases" 
          data={[
            { name: 'Disposed', value: chartsData.disposed },
            { name: 'Pending', value: chartsData.pending },
          ]} 
          dataKey="value" 
          nameKey="name" 
        />
      </Grid>

      {/* Disposition by case type (Stacked Bar Chart) */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>Disposition by Case Type</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartsData.stackedData}>
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(chartsData.stackedData[0] || {}).filter(key => key !== 'type').map((key, index) => (
                <Bar key={key} dataKey={key} stackId="a" fill={COLORS[index % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Case disposal by method */}
      <Grid item xs={12} md={6}>
        <PieChartComponent 
          title="Case Disposal by Method" 
          data={chartsData.disposalByMethod} 
          dataKey="value" 
          nameKey="name" 
        />
      </Grid>

      {/* Average time to disposal by method */}
      <Grid item xs={12} md={6}>
        <BarChartComponent 
          title="Average Time to Disposal by Method (days)" 
          data={chartsData.avgDisposalByMethod} 
          dataKey="averageDisposalTime" 
          fill="#FF8042" 
        />
      </Grid>

      {/* Case status breakdown */}
      <Grid item xs={12} md={6}>
        <PieChartComponent 
          title="Case Status Breakdown" 
          data={chartsData.caseStatus} 
          dataKey="value" 
          nameKey="name" 
        />
      </Grid>

      {/* Withdrawn vs settled cases */}
      <Grid item xs={12} md={6}>
        <BarChartComponent 
          title="Withdrawn vs Settled Cases" 
          data={[
            { name: 'Withdrawn', value: chartsData.withdrawn },
            { name: 'Settled', value: chartsData.settled },
          ]} 
          dataKey="value" 
          fill="#82ca9d" 
        />
      </Grid>

      {/* Cases disposed in Lok Adalat (Radar Chart) */}
      <Grid item xs={12} md={6}>
        <RadarChartComponent 
          title="Cases Disposed in Lok Adalat" 
          data={[
            { subject: 'Lok Adalat', A: chartsData.lokAdalatCases },
            { subject: 'Other Methods', A: chartsData.disposed - chartsData.lokAdalatCases },
          ]} 
          dataKey="A" 
          nameKey="subject" 
        />
      </Grid>

      {/* Monthly case disposal trend */}
      <Grid item xs={12} md={6}>
        <LineChartComponent 
          title="Monthly Case Disposal Trend" 
          data={chartsData.monthlyDisposals} 
          dataKey="value" 
          stroke="#FFBB28" 
        />
      </Grid>

      {/* Average time to case disposal */}
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>Average Time to Case Disposal</Typography>
          <Typography variant="h4">{chartsData.avgDisposalTime} days</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default CaseOutcomeAnalysis;
