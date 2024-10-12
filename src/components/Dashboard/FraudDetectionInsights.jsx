// src/components/Dashboard/FraudDetectionInsights.jsx
import React, { useEffect, useState } from 'react';
import { Grid } from "@mui/material";
import BarChartComponent from '../charts/BarChartComponent';
import ScatterChartComponent from '../charts/ScatterChartComponent';
import PieChartComponent from '../charts/PieChartComponent';
import caseData from "../../data/data.json";

const FraudDetectionInsights = () => {
  const [chartsData, setChartsData] = useState({});

  useEffect(() => {
    const processedData = caseData.map(item => ({
      ...item,
      settlement_amount: item.settlement_amount || '0',
      hearing_count: item.hearing_count || 0,
    }));

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

    // Frequent claimants
    const frequentClaimants = countOccurrences(processedData, 'Petitioner');

    // Frequent respondents
    const frequentRespondents = countOccurrences(processedData, 'Respondent');

    // Average settlement amount vs. hearing count
    const settlementVsHearings = processedData.map(item => ({
      settlementAmount: parseFloat(item.settlement_amount),
      hearingCount: parseInt(item.hearing_count, 10),
    }));

    // Unusually quick settlements
    const quickSettlements = processedData.filter(item => 
      parseFloat(item.settlement_amount) > 100000 && parseInt(item.hearing_count, 10) < 5
    ).map(item => ({
      settlementAmount: parseFloat(item.settlement_amount),
      hearingCount: parseInt(item.hearing_count, 10),
    }));

    setChartsData({
      frequentClaimants: prepareChartData(frequentClaimants),
      frequentRespondents: prepareChartData(frequentRespondents),
      settlementVsHearings,
      quickSettlements,
    });
  }, []);

  return (
    <Grid container spacing={3}>
      {/* Frequent claimants */}
      <Grid item xs={12} md={6}>
        <BarChartComponent 
          title="Frequent Claimants" 
          data={chartsData.frequentClaimants.slice(0, 10)} // Top 10
          dataKey="value" 
          fill="#FF8042" 
        />
      </Grid>

      {/* Frequent respondents */}
      <Grid item xs={12} md={6}>
        <BarChartComponent 
          title="Frequent Respondents" 
          data={chartsData.frequentRespondents.slice(0, 10)} // Top 10
          dataKey="value" 
          fill="#00C49F" 
        />
      </Grid>

      {/* Average settlement amount vs. hearing count */}
      <Grid item xs={12} md={6}>
        <ScatterChartComponent 
          title="Settlement Amount vs. Hearing Count" 
          data={chartsData.settlementVsHearings} 
          xKey="hearingCount" 
          yKey="settlementAmount" 
          fill="#8884d8" 
        />
      </Grid>

      {/* High-value settlements with few hearings */}
      <Grid item xs={12} md={6}>
        <ScatterChartComponent 
          title="High-Value Settlements with Few Hearings" 
          data={chartsData.quickSettlements} 
          xKey="hearingCount" 
          yKey="settlementAmount" 
          fill="#FFBB28" 
        />
      </Grid>
    </Grid>
  );
};

export default FraudDetectionInsights;
