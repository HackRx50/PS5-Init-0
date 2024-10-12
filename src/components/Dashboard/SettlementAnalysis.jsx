// src/components/Dashboard/SettlementAnalysis.jsx
import React, { useEffect, useState } from 'react';
import { Grid } from "@mui/material";
import BarChartComponent from '../charts/BarChartComponent';
import LineChartComponent from '../charts/LineChartComponent';
import ScatterChartComponent from '../charts/ScatterChartComponent';
import PieChartComponent from '../charts/PieChartComponent';
import caseData from "../../data/data.json";

const SettlementAnalysis = () => {
  const [chartsData, setChartsData] = useState({});

  useEffect(() => {
    const processedData = caseData.map(item => ({
      ...item,
      decisionDate: item.decision_date ? new Date(item.decision_date) : null,
      settlement_amount: item.settlement_amount || '0', // Ensure settlement_amount exists
      requested_amount: item.requested_amount || '0', // Ensure requested_amount exists
    })).filter(item => !isNaN(item.decisionDate));

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

    // Total settlement amount by year
    const settlementByYear = processedData.reduce((acc, curr) => {
      const year = curr.decisionDate ? curr.decisionDate.getFullYear() : 'Unknown';
      const amount = parseFloat(curr.settlement_amount) || 0;
      acc[year] = (acc[year] || 0) + amount;
      return acc;
    }, {});

    // Monthly settlement amounts
    const monthlySettlements = processedData.reduce((acc, curr) => {
      if (curr.decisionDate) {
        const monthYear = curr.decisionDate.toISOString().slice(0, 7);
        const amount = parseFloat(curr.settlement_amount) || 0;
        acc[monthYear] = (acc[monthYear] || 0) + amount;
      }
      return acc;
    }, {});

    // Average settlement amount by case type
    const settlementByType = processedData.reduce((acc, curr) => {
      const type = curr.case_type || 'Unknown';
      const amount = parseFloat(curr.settlement_amount) || 0;
      if (!acc[type]) {
        acc[type] = { total: 0, count: 0 };
      }
      acc[type].total += amount;
      acc[type].count += 1;
      return acc;
    }, {});

    const avgSettlementByType = Object.entries(settlementByType).map(([type, { total, count }]) => ({
      type,
      averageSettlement: parseFloat((total / count).toFixed(2)),
    }));

    // High-value settlements (> Rs. 1 lakh) – Scatter plot
    const highValueSettlements = processedData.filter(item => parseFloat(item.settlement_amount) > 100000).map(item => ({
      settlementAmount: parseFloat(item.settlement_amount),
      requestedAmount: parseFloat(item.requested_amount) || 0,
    }));

    setChartsData({
      settlementByYear: prepareChartData(settlementByYear),
      monthlySettlements: prepareChartData(monthlySettlements),
      avgSettlementByType,
      highValueSettlements,
    });
  }, []);

  return (
    <Grid container spacing={3}>
      {/* Total settlement amount by year */}
      <Grid item xs={12} md={6}>
        <BarChartComponent 
          title="Total Settlement Amount by Year" 
          data={chartsData.settlementByYear} 
          dataKey="value" 
          fill="#8884d8" 
        />
      </Grid>

      {/* Monthly settlement amounts */}
      <Grid item xs={12} md={6}>
        <LineChartComponent 
          title="Monthly Settlement Amounts" 
          data={chartsData.monthlySettlements} 
          dataKey="value" 
          stroke="#82ca9d" 
        />
      </Grid>

      {/* Average settlement amount by case type */}
      <Grid item xs={12} md={6}>
        <BarChartComponent 
          title="Average Settlement Amount by Case Type" 
          data={chartsData.avgSettlementByType} 
          dataKey="averageSettlement" 
          fill="#FF8042" 
        />
      </Grid>

      {/* High-value settlements */}
      <Grid item xs={12} md={6}>
        <ScatterChartComponent 
          title="High-Value Settlements (> Rs. 1 Lakh)" 
          data={chartsData.highValueSettlements} 
          xKey="requestedAmount" 
          yKey="settlementAmount" 
          fill="#FFBB28" 
        />
      </Grid>

      {/* Add more charts as per your list following the same pattern */}
    </Grid>
  );
};

export default SettlementAnalysis;
