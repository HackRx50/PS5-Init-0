// src/components/Dashboard/GeographicalAnalysis.jsx
import React, { useEffect, useState } from 'react';
import { Grid } from "@mui/material";
import ChoroplethMap from '../charts/ChoroplethMap';
import BarChartComponent from '../charts/BarChartComponent';
import caseData from "../../data/data.json";

const GeographicalAnalysis = () => {
  const [chartsData, setChartsData] = useState({});

  useEffect(() => {
    const processedData = caseData.map(item => ({
      ...item,
      District: item.District || 'Unknown',
      settlement_amount: parseFloat(item.settlement_amount) || 0,
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

    // Settlement amounts by region
    const settlementByRegion = processedData.reduce((acc, curr) => {
      const region = curr.District;
      acc[region] = (acc[region] || 0) + curr.settlement_amount;
      return acc;
    }, {});

    // Cases filed by region
    const casesByRegion = countOccurrences(processedData, 'District');

    // Case disposal by region
    const disposalByRegion = processedData.reduce((acc, curr) => {
      const region = curr.District;
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {});

    setChartsData({
      settlementByRegion: prepareChartData(settlementByRegion),
      casesByRegion: prepareChartData(casesByRegion),
      disposalByRegion: prepareChartData(disposalByRegion),
    });
  }, []);

  return (
    <Grid container spacing={3}>
      {/* Settlement amounts by region - Heatmap (Choropleth Map) */}
      <Grid item xs={12}>
        <ChoroplethMap 
          title="Settlement Amounts by Region" 
          data={chartsData.settlementByRegion} 
          dataKey="value" 
        />
      </Grid>

      {/* Cases filed by region - Heatmap */}
      <Grid item xs={12}>
        <ChoroplethMap 
          title="Cases Filed by Region" 
          data={chartsData.casesByRegion} 
          dataKey="value" 
        />
      </Grid>

      {/* Case disposal by region - Heatmap */}
      <Grid item xs={12}>
        <ChoroplethMap 
          title="Case Disposal by Region" 
          data={chartsData.disposalByRegion} 
          dataKey="value" 
        />
      </Grid>

      {/* Add more geographical charts as needed */}
    </Grid>
  );
};

export default GeographicalAnalysis;
