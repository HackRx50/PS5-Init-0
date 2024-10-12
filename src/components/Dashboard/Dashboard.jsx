// src/components/Dashboard/Dashboard.jsx
import React from 'react';
import { Box, Typography, Tabs, Tab } from "@mui/material";
import CaseVolumeTrends from './CaseVolumeTrends';
import CaseOutcomeAnalysis from './CaseOutcomeAnalysis';
import SettlementAnalysis from './SettlementAnalysis';
import FraudDetectionInsights from './FraudDetectionInsights';
import GeographicalAnalysis from './GeographicalAnalysis';
// Import other sections as needed

const Dashboard = () => {
  const [tab, setTab] = React.useState(0);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Box m={3}>
      <Typography variant="h4" gutterBottom>Judiciary Data Analytics Dashboard</Typography>
      <Tabs value={tab} onChange={handleChange} variant="scrollable" scrollButtons="auto">
        <Tab label="Case Volume & Trends" />
        <Tab label="Case Outcome Analysis" />
        <Tab label="Settlement Analysis" />
        <Tab label="Fraud Detection Insights" />
        <Tab label="Geographical Analysis" />
        {/* Add more tabs as per sections */}
      </Tabs>
      <Box mt={2}>
        {tab === 0 && <CaseVolumeTrends />}
        {tab === 1 && <CaseOutcomeAnalysis />}
        {tab === 2 && <SettlementAnalysis />}
        {tab === 3 && <FraudDetectionInsights />}
        {tab === 4 && <GeographicalAnalysis />}
        {/* Render other sections similarly */}
      </Box>
    </Box>
  );
};

export default Dashboard;
