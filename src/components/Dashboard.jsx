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
     
      setDashboardData({
        summaryData: {
          totalClaims: 2341,
          fraudCases: 75,
          averageClaimAmount: 9250,
          pendingReviews: 125
        },
        monthlyData: [
          { month: 'Jan', claims: 190 }, { month: 'Feb', claims: 210 },
          { month: 'Mar', claims: 225 }, { month: 'Apr', claims: 280 },
          { month: 'May', claims: 265 }, { month: 'Jun', claims: 240 },
          { month: 'Jul', claims: 310 }, { month: 'Aug', claims: 350 },
          { month: 'Sep', claims: 400 }, { month: 'Oct', claims: 370 },
          { month: 'Nov', claims: 390 }, { month: 'Dec', claims: 420 }
        ],
        yearlyData: [
          { year: '2019', claims: 1580 },
          { year: '2020', claims: 1920 },
          { year: '2021', claims: 1850 },
          { year: '2022', claims: 2300 },
          { year: '2023', claims: 2700 }
        ],
        claimTypeData: [
          { type: 'Health', value: 1050 },
          { type: 'Property', value: 780 },
          { type: 'Life', value: 450 },
          { type: 'Auto', value: 250 }
        ],
        sectionData: [
          { section: 'Section A', value: 520 },
          { section: 'Section B', value: 340 },
          { section: 'Section C', value: 280 },
          { section: 'Section D', value: 150 }
        ],
        fraudData: [
          { name: 'Fraud', value: 75 },
          { name: 'Non-Fraud', value: 2266 }
        ],
        monthlyFraudData: [
          { month: 'Jan', fraudCases: 6 }, { month: 'Feb', fraudCases: 8 },
          { month: 'Mar', fraudCases: 10 }, { month: 'Apr', fraudCases: 9 },
          { month: 'May', fraudCases: 7 }, { month: 'Jun', fraudCases: 12 }
        ],
        topFraudClaims: [
          { id: 43, amount: 100000 },
          { id: 92, amount: 85000 },
          { id: 111, amount: 75000 },
          { id: 123, amount: 62000 },
          { id: 69, amount: 58000 }
        ],
        avgFraudAmount: [
          { month: 'Jan', amount: 50000 }, { month: 'Feb', amount: 46000 },
          { month: 'Mar', amount: 55000 }, { month: 'Apr', amount: 62000 },
          { month: 'May', amount: 53000 }, { month: 'Jun', amount: 58000 }
        ],
        caseOutcomeData: [
          { outcome: 'Resolved', value: 1950 },
          { outcome: 'Pending', value: 280 },
          { outcome: 'Dismissed', value: 125 }
        ],
        resolutionTimeData: [
          { month: 'Jan', time: 12 }, { month: 'Feb', time: 14 },
          { month: 'Mar', time: 11 }, { month: 'Apr', time: 16 },
          { month: 'May', time: 13 }, { month: 'Jun', time: 14 }
        ],
        claimVsPayoutData: [
          { month: 'Jan', claim: 450000, payout: 420000 },
          { month: 'Feb', claim: 500000, payout: 470000 },
          { month: 'Mar', claim: 480000, payout: 440000 },
          { month: 'Apr', claim: 520000, payout: 500000 },
          { month: 'May', claim: 510000, payout: 470000 },
          { month: 'Jun', claim: 550000, payout: 530000 }
        ],
        topApplicantsData: [
          { name: 'Amit Sharma', claims: 18 },
          { name: 'Priya Nair', claims: 15 },
          { name: 'Rajiv Mehta', claims: 12 },
          { name: 'Sunita Patel', claims: 10 },
          { name: 'Vikas Reddy', claims: 8 }
        ],
        topFraudSuspectsData: [
          { name: 'Taher Afsar', fraudClaims: 1 },
          { name: 'John Doe', fraudClaims: 1 },
          { name: 'Ravi Deshmukh', fraudClaims: 2 },
          { name: 'Rakesh Kumar', fraudClaims: 1 },
          { name: 'Sangeeta Iyer', fraudClaims: 1 }
        ],
        alarmTriggersData: [
          { month: 'Jan', triggers: 35 }, { month: 'Feb', triggers: 28 },
          { month: 'Mar', triggers: 42 }, { month: 'Apr', triggers: 36 },
          { month: 'May', triggers: 50 }, { month: 'Jun', triggers: 45 }
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
              labels: dashboardData.topFraudClaims.map(item => `Claim Id: ${item.id}`),
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