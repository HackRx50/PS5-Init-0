import React, { useState, useEffect, useRef } from 'react';
import { Box, Grid, Heading, Text, Flex, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import Chart from 'chart.js/auto';

const DataCard = ({ title, value, helpText }) => (
  <Box borderWidth="1px" borderRadius="lg" p={4} flex="1">
    <Text fontSize="lg" fontWeight="bold">{title}</Text>
    <Text fontSize="3xl">{value}</Text>
    {helpText && <Text fontSize="sm" color="gray.500">{helpText}</Text>}
  </Box>
);

const ChartComponent = ({ data, type, options }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(ctx, {
        type,
        data,
        options: {
          ...options,
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, type, options]);

  return <canvas ref={chartRef} style={{ width: '100%', height: '100%' }} />;
};

const ChartModal = ({ isOpen, onClose, title, children }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="5xl">
    <ModalOverlay />
    <ModalContent maxWidth="90vw" maxHeight="90vh">
      <ModalHeader>{title}</ModalHeader>
      <ModalCloseButton />
      <ModalBody p={6} overflowY="auto">
        {children}
      </ModalBody>
    </ModalContent>
  </Modal>
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    summaryData: {},
    monthlyData: [],
    yearlyData: [],
    claimTypeData: [],
    sectionData: [],
    fraudData: [],
    monthlyFraudData: [],
    topFraudClaims: [],
    avgFraudAmount: [],
    caseOutcomeData: [],
    resolutionTimeData: [],
    claimVsPayoutData: [],
    topApplicantsData: [],
    topFraudSuspectsData: [],
    alarmTriggersData: []
  });

  const { isOpen: isDistributionOpen, onOpen: onDistributionOpen, onClose: onDistributionClose } = useDisclosure();
  const { isOpen: isFraudOpen, onOpen: onFraudOpen, onClose: onFraudClose } = useDisclosure();
  const { isOpen: isOutcomesOpen, onOpen: onOutcomesOpen, onClose: onOutcomesClose } = useDisclosure();

  useEffect(() => {
    // Simulating API call to fetch data
    const fetchData = async () => {
      // In a real application, this would be an API call
      // For now, we'll use placeholder data
      setDashboardData({
        summaryData: {
          totalClaims: 1234,
          fraudCases: 56,
          averageClaimAmount: 5678,
          pendingReviews: 89
        },
        monthlyData: [
          { month: 'Jan', claims: 65 }, { month: 'Feb', claims: 59 },
          { month: 'Mar', claims: 80 }, { month: 'Apr', claims: 81 },
          { month: 'May', claims: 56 }, { month: 'Jun', claims: 55 },
          { month: 'Jul', claims: 40 }, { month: 'Aug', claims: 70 },
          { month: 'Sep', claims: 90 }, { month: 'Oct', claims: 85 },
          { month: 'Nov', claims: 78 }, { month: 'Dec', claims: 92 }
        ],
        yearlyData: [
          { year: '2019', claims: 300 },
          { year: '2020', claims: 450 },
          { year: '2021', claims: 320 },
          { year: '2022', claims: 500 },
          { year: '2023', claims: 380 }
        ],
        claimTypeData: [
          { type: 'Health', value: 400 },
          { type: 'Property', value: 300 },
          { type: 'Life', value: 200 },
          { type: 'Auto', value: 100 }
        ],
        sectionData: [
          { section: 'Section A', value: 250 },
          { section: 'Section B', value: 150 },
          { section: 'Section C', value: 100 },
          { section: 'Section D', value: 50 }
        ],
        fraudData: [
          { name: 'Fraud', value: 15 },
          { name: 'Non-Fraud', value: 85 }
        ],
        monthlyFraudData: [
          { month: 'Jan', fraudCases: 5 }, { month: 'Feb', fraudCases: 7 },
          { month: 'Mar', fraudCases: 6 }, { month: 'Apr', fraudCases: 8 },
          { month: 'May', fraudCases: 4 }, { month: 'Jun', fraudCases: 9 }
        ],
        topFraudClaims: [
          { id: 1, amount: 50000 },
          { id: 2, amount: 45000 },
          { id: 3, amount: 40000 },
          { id: 4, amount: 35000 },
          { id: 5, amount: 30000 }
        ],
        avgFraudAmount: [
          { month: 'Jan', amount: 30000 }, { month: 'Feb', amount: 32000 },
          { month: 'Mar', amount: 28000 }, { month: 'Apr', amount: 35000 },
          { month: 'May', amount: 31000 }, { month: 'Jun', amount: 33000 }
        ],
        caseOutcomeData: [
          { outcome: 'Resolved', value: 500 },
          { outcome: 'Pending', value: 300 },
          { outcome: 'Dismissed', value: 200 }
        ],
        resolutionTimeData: [
          { month: 'Jan', time: 15 }, { month: 'Feb', time: 18 },
          { month: 'Mar', time: 14 }, { month: 'Apr', time: 16 },
          { month: 'May', time: 17 }, { month: 'Jun', time: 15 }
        ],
        claimVsPayoutData: [
          { month: 'Jan', claim: 150000, payout: 120000 },
          { month: 'Feb', claim: 180000, payout: 150000 },
          { month: 'Mar', claim: 160000, payout: 130000 },
          { month: 'Apr', claim: 200000, payout: 170000 },
          { month: 'May', claim: 170000, payout: 140000 },
          { month: 'Jun', claim: 190000, payout: 160000 }
        ],
        topApplicantsData: [
          { name: 'John Doe', claims: 10 },
          { name: 'Jane Smith', claims: 8 },
          { name: 'Bob Johnson', claims: 7 },
          { name: 'Alice Brown', claims: 6 },
          { name: 'Charlie Davis', claims: 5 }
        ],
        topFraudSuspectsData: [
          { name: 'Suspect A', fraudClaims: 5 },
          { name: 'Suspect B', fraudClaims: 4 },
          { name: 'Suspect C', fraudClaims: 3 },
          { name: 'Suspect D', fraudClaims: 3 },
          { name: 'Suspect E', fraudClaims: 2 }
        ],
        alarmTriggersData: [
          { month: 'Jan', triggers: 20 }, { month: 'Feb', triggers: 25 },
          { month: 'Mar', triggers: 18 }, { month: 'Apr', triggers: 22 },
          { month: 'May', triggers: 27 }, { month: 'Jun', triggers: 23 }
        ]
      });
    };

    fetchData();

    const intervalId = setInterval(fetchData, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const chartHeight = "250px";
  const chartColors = {
    lightBlue: 'rgba(173, 216, 230, 0.8)',
    blue: 'rgba(70, 130, 180, 0.8)',
    darkBlue: 'rgba(0, 0, 139, 0.8)',
    lightGrey: 'rgba(211, 211, 211, 0.8)',
    grey: 'rgba(128, 128, 128, 0.8)',
    darkGrey: 'rgba(69, 69, 69, 0.8)',
    white: 'rgba(255, 255, 255, 0.8)',
    black: 'rgba(0, 0, 0, 0.8)',
  };

  return (
    <Box p={5}>
      <Flex justifyContent="center" alignItems="center" mb={6}>
        <Flex gap={6}>
          <Button onClick={onDistributionOpen}>Claims Distribution</Button>
          <Button onClick={onFraudOpen}>Fraud Insights</Button>
          <Button onClick={onOutcomesOpen}>Case Outcomes</Button>
        </Flex>
      </Flex>
      
      <Flex gap={8} mb={8}>
        <DataCard title="Total Claims" value={dashboardData.summaryData.totalClaims} helpText="Last 30 days" />
        <DataCard title="Fraud Cases" value={dashboardData.summaryData.fraudCases} helpText="4.5% of total claims" />
        <DataCard title="Average Claim Amount" value={`$${dashboardData.summaryData.averageClaimAmount}`} />
        <DataCard title="Pending Reviews" value={dashboardData.summaryData.pendingReviews} />
      </Flex>

      <Flex mb={8} gap={8}>
        <Box width="30%">
          <Heading size="md" mb={3}>Top Suspects for Fraud</Heading>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th isNumeric>Fraudulent Claims</Th>
              </Tr>
            </Thead>
            <Tbody>
              {dashboardData.topFraudSuspectsData.slice(0, 5).map((suspect, index) => (
                <Tr key={index}>
                  <Td>{suspect.name}</Td>
                  <Td isNumeric>{suspect.fraudClaims}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        <Box width="35%" height={chartHeight}>
          <Heading size="sm" mb={3}>Monthly Case Distribution</Heading>
          <ChartComponent 
            type="line"
            data={{
              labels: dashboardData.monthlyData.map(item => item.month),
              datasets: [{
                label: 'Number of Claims',
                data: dashboardData.monthlyData.map(item => item.claims),
                borderColor: chartColors.blue,
                backgroundColor: chartColors.lightBlue,
                tension: 0.1
              }]
            }}
          />
        </Box>
        <Box width="35%" height={chartHeight}>
          <Heading size="sm" mb={3}>Fraud Cases vs Non-Fraud Cases</Heading>
          <ChartComponent 
            type="pie"
            data={{
              labels: ['Fraud', 'Non-Fraud'],
              datasets: [{
                data: [dashboardData.summaryData.fraudCases, dashboardData.summaryData.totalClaims - dashboardData.summaryData.fraudCases],
                backgroundColor: [chartColors.darkBlue, chartColors.lightGrey],
              }]
            }}
          />
        </Box>
      </Flex>

      <Flex justifyContent="center" gap={8} mb={8}>
        <Box width="45%" height={chartHeight}>
          <Heading size="sm" mb={3}>Top Fraudulent Claims</Heading>
          <ChartComponent 
            type="bar"
            data={{
              labels: dashboardData.topFraudClaims.map(item => `Claim ${item.id}`),
              datasets: [{
                label: 'Claim Amount',
                data: dashboardData.topFraudClaims.map(item => item.amount),
                backgroundColor: chartColors.blue,
              }]
            }}
          />
        </Box>
        <Box width="45%" height={chartHeight}>
          <Heading size="sm" mb={3}>Case Outcome Distribution</Heading>
          <ChartComponent 
            type="pie"
            data={{
              labels: dashboardData.caseOutcomeData.map(item => item.outcome),
              datasets: [{
                data: dashboardData.caseOutcomeData.map(item => item.value),
                backgroundColor: [chartColors.lightBlue, chartColors.blue, chartColors.darkBlue],
              }]
            }}
          />
        </Box>
      </Flex>

      <ChartModal isOpen={isDistributionOpen} onClose={onDistributionClose} title="Claims Distribution">
        <Grid templateColumns="repeat(2, 1fr)" gap={8}>
          <Box height={chartHeight}>
            <Heading size="sm" mb={3}>Yearly Case Distribution</Heading>
            <ChartComponent 
              type="bar"
              data={{
                labels: dashboardData.yearlyData.map(item => item.year),
                datasets: [{
                  label: 'Number of Claims',
                  data: dashboardData.yearlyData.map(item => item.claims),
                  backgroundColor: chartColors.blue,
                }]
              }}
            />
          </Box>
          <Box height={chartHeight}>
            <Heading size="sm" mb={3}>Case Distribution by Claim Type</Heading>
            <ChartComponent 
              type="pie"
              data={{
                labels: dashboardData.claimTypeData.map(item => item.type),
                datasets: [{
                  data: dashboardData.claimTypeData.map(item => item.value),
                  backgroundColor: [chartColors.lightBlue, chartColors.blue, chartColors.darkBlue, chartColors.grey],
                }]
              }}
            />
          </Box>
        </Grid>
      </ChartModal>

      <ChartModal isOpen={isFraudOpen} onClose={onFraudClose} title="Fraud Insights">
        <Grid templateColumns="repeat(2, 1fr)" gap={8}>
          <Box height={chartHeight}>
            <Heading size="sm" mb={3}>Monthly Fraud Detection Trend</Heading>
            <ChartComponent 
              type="line"
              data={{
                labels: dashboardData.monthlyFraudData.map(item => item.month),
                datasets: [{
                  label: 'Fraud Cases',
                  data: dashboardData.monthlyFraudData.map(item => item.fraudCases),
                  borderColor: chartColors.darkBlue,
                  backgroundColor: chartColors.lightBlue,
                  tension: 0.1
                }]
              }}
            />
          </Box>
          <Box height={chartHeight}>
            <Heading size="sm" mb={3}>Average Fraud Amount</Heading>
            <ChartComponent 
              type="line"
              data={{
                labels: dashboardData.avgFraudAmount.map(item => item.month),
                datasets: [{
                  label: 'Average Fraud Amount',
                  data: dashboardData.avgFraudAmount.map(item => item.amount),
                  borderColor: chartColors.blue,
                  backgroundColor: chartColors.lightGrey,
                  tension: 0.1
                }]
              }}
            />
          </Box>
        </Grid>
      </ChartModal>

      <ChartModal isOpen={isOutcomesOpen} onClose={onOutcomesClose} title="Case Outcomes and Company Impact">
        <Grid templateColumns="repeat(2, 1fr)" gap={8}>
          <Box height={chartHeight}>
            <Heading size="sm" mb={3}>Average Claim Resolution Time</Heading>
            <ChartComponent 
              type="bar"
              data={{
                labels: dashboardData.resolutionTimeData.map(item => item.month),
                datasets: [{
                  label: 'Resolution Time (days)',
                  data: dashboardData.resolutionTimeData.map(item => item.time),
                  backgroundColor: chartColors.blue,
                }]
              }}
            />
          </Box>
          <Box height={chartHeight}>
            <Heading size="sm" mb={3}>Claim Amount vs Payout</Heading>
            <ChartComponent 
              type="bar"
              data={{
                labels: dashboardData.claimVsPayoutData.map(item => item.month),
                datasets: [
                  {
                    label: 'Claim Amount',
                    data: dashboardData.claimVsPayoutData.map(item => item.claim),
                    backgroundColor: chartColors.lightBlue,
                  },
                  {
                    label: 'Payout Amount',
                    data: dashboardData.claimVsPayoutData.map(item => item.payout),
                    backgroundColor: chartColors.darkBlue,
                  }
                ]
              }}
              options={{
                scales: {
                  x: { stacked: true },
                  y: { stacked: true }
                }
              }}
            />
          </Box>
        </Grid>
      </ChartModal>
    </Box>
  );
};

export default Dashboard;