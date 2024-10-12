// src/components/Dashboard/CaseVolumeTrends.jsx
import React, { useEffect, useState } from 'react';
import { Grid } from "@mui/material";
import BarChartComponent from '../charts/BarChartComponent';
import LineChartComponent from '../charts/LineChartComponent';
import PieChartComponent from '../charts/PieChartComponent';
import HeatmapComponent from '../charts/HeatmapComponent';
import HistogramComponent from '../charts/HistogramComponent';
import caseData from "../../data/data.json";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const CaseVolumeTrends = () => {
  const [chartsData, setChartsData] = useState({});

  useEffect(() => {
    // Process data
    const processedData = caseData.map(item => ({
      ...item,
      filingDate: new Date(item.filing_date),
      disposalDuration: item.decision_date ? 
        (new Date(item.decision_date) - new Date(item.filing_date)) / (1000 * 60 * 60 * 24) : null
    })).filter(item => !isNaN(item.filingDate));

    // Define helper functions
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

    const getWeekNumber = (date) => {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };

    // Total cases by year
    const casesByYear = countOccurrences(processedData, 'Year');

    // Monthly filings
    const monthlyFilings = processedData.reduce((acc, curr) => {
      const monthYear = curr.filingDate.toISOString().slice(0, 7); // "YYYY-MM"
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {});

    // Cases by District
    const casesByDistrict = countOccurrences(processedData, 'District');

    // Cases by Court Complex
    const casesByCourt = countOccurrences(processedData, 'Court Complex');

    // Cases by Judge
    const casesByJudge = countOccurrences(processedData, 'court_number_and_judge');

    // Cases by Type
    const casesByType = countOccurrences(processedData, 'case_type');

    // Cases by Respondent Type
    const casesByRespondentType = processedData.reduce((acc, curr) => {
      const respondent = curr.Respondent || 'Unknown';
      acc[respondent] = (acc[respondent] || 0) + 1;
      return acc;
    }, {});

    // Comparison of current year vs previous year
    const years = Object.keys(casesByYear).sort();
    const currentYear = years[years.length - 1];
    const previousYear = years[years.length - 2] || currentYear - 1;
    const comparisonData = [
      { year: previousYear, filings: casesByYear[previousYear] || 0 },
      { year: currentYear, filings: casesByYear[currentYear] || 0 },
    ];

    // Weekly filings
    const weeklyFilings = processedData.reduce((acc, curr) => {
      const week = getWeekNumber(curr.filingDate);
      acc[`Week ${week}`] = (acc[`Week ${week}`] || 0) + 1;
      return acc;
    }, {});

    // Filing date distribution for Histogram
    const filingDurations = processedData.map(item => {
      const start = item.filingDate;
      return start.getDate() + (start.getMonth() * 30); // Simplistic day calculation
    });

    setChartsData({
      casesByYear: prepareChartData(casesByYear),
      monthlyFilings: prepareChartData(monthlyFilings),
      casesByDistrict: prepareChartData(casesByDistrict),
      casesByCourt: prepareChartData(casesByCourt),
      casesByJudge: prepareChartData(casesByJudge),
      casesByType: prepareChartData(casesByType),
      casesByRespondentType: prepareChartData(casesByRespondentType),
      comparisonData,
      weeklyFilings: prepareChartData(weeklyFilings),
      filingDurations, // For histogram
    });
  }, []);

  // Function to create bins for histogram
  const createHistogramData = (durations, binSize = 10) => {
    const max = Math.max(...durations);
    const bins = Math.ceil(max / binSize);
    const histogram = Array(bins).fill(0);
    durations.forEach(duration => {
      const bin = Math.floor(duration / binSize);
      histogram[bin] += 1;
    });
    return histogram.map((count, index) => ({
      range: `${index * binSize}-${(index + 1) * binSize}`,
      value: count,
    }));
  };

  return (
    <Grid container spacing={3}>
      {/* Total cases filed by year */}
      <Grid item xs={12} md={6}>
        <BarChartComponent 
          title="Total Cases Filed by Year" 
          data={chartsData.casesByYear} 
          dataKey="value" 
          fill="#8884d8" 
        />
      </Grid>

      {/* Monthly case filings trend */}
      <Grid item xs={12} md={6}>
        <LineChartComponent 
          title="Monthly Case Filings Trend" 
          data={chartsData.monthlyFilings} 
          dataKey="value" 
          stroke="#82ca9d" 
        />
      </Grid>

      {/* Case filings by district (Heatmap) */}
      <Grid item xs={12}>
        {/* Assuming you have xLabels and yLabels prepared */}
        {/* Placeholder example */}
        {/* Implement HeatmapComponent accordingly */}
      </Grid>

      {/* Case filings by court */}
      <Grid item xs={12} md={6}>
        <BarChartComponent 
          title="Case Filings by Court" 
          data={chartsData.casesByCourt} 
          dataKey="value" 
          fill="#FF8042" 
        />
      </Grid>

      {/* Case filings by judge */}
      <Grid item xs={12} md={6}>
        <PieChartComponent 
          title="Case Filings by Judge" 
          data={chartsData.casesByJudge} 
          dataKey="value" 
          nameKey="name" 
        />
      </Grid>

      {/* Case filings by case type */}
      <Grid item xs={12} md={6}>
        <BarChartComponent 
          title="Case Filings by Case Type" 
          data={chartsData.casesByType} 
          dataKey="value" 
          fill="#00C49F" 
        />
      </Grid>

      {/* Case filings by respondent type */}
      <Grid item xs={12} md={6}>
        <BarChartComponent 
          title="Case Filings by Respondent Type" 
          data={chartsData.casesByRespondentType} 
          dataKey="value" 
          fill="#FFBB28" 
        />
      </Grid>

      {/* Comparison of current year vs previous year */}
      <Grid item xs={12} md={6}>
        <BarChartComponent 
          title="Current Year vs Previous Year Filings" 
          data={chartsData.comparisonData} 
          dataKey="filings" 
          fill="#8884d8" 
        />
      </Grid>

      {/* Weekly case filings */}
      <Grid item xs={12} md={6}>
        <LineChartComponent 
          title="Weekly Case Filings" 
          data={chartsData.weeklyFilings} 
          dataKey="value" 
          stroke="#FF8042" 
        />
      </Grid>

      {/* Filing date distribution (Histogram) */}
      <Grid item xs={12} md={6}>
        <HistogramComponent 
          title="Filing Date Distribution" 
          data={createHistogramData(chartsData.filingDurations)} 
          dataKey="value" 
          fill="#82ca9d" 
        />
      </Grid>
    </Grid>
  );
};

export default CaseVolumeTrends;
