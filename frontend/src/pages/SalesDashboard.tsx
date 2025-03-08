import React, { useState } from 'react';
import {
  Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText,
  StatArrow, Tabs, TabList, TabPanels, Tab, TabPanel, Button,
  Flex, Text, Table, Thead, Tbody, Tr, Th, Td, Badge, Select,
  Divider, useToast, Icon, Progress
} from '@chakra-ui/react';
import { 
  FiTrendingUp, FiPhoneCall, FiUsers, FiCalendar, 
  FiBarChart2, FiTarget, FiPhone, FiRefreshCw 
} from 'react-icons/fi';
import { SalesPipeline } from '../components/SalesPipeline';
import { VoipCaller } from '../components/VoipCaller';

// Demo data
const RECENT_ACTIVITIES = [
  { 
    id: 'act-001', 
    type: 'call', 
    timestamp: '2023-08-15T10:30:00Z', 
    summary: 'Call with John Smith from Acme Corp', 
    entity_id: 'deal-001',
    entity_name: 'Enterprise License - Acme Corp'
  },
  { 
    id: 'act-002', 
    type: 'email', 
    timestamp: '2023-08-15T09:15:00Z', 
    summary: 'Sent proposal to Sarah Johnson at Globex Inc', 
    entity_id: 'deal-002',
    entity_name: 'Department Rollout - Globex Inc'
  },
  { 
    id: 'act-003', 
    type: 'meeting', 
    timestamp: '2023-08-14T15:45:00Z', 
    summary: 'Product demo with Tech Solutions team', 
    entity_id: 'deal-004',
    entity_name: 'Annual Renewal - Tech Solutions'
  },
  { 
    id: 'act-004', 
    type: 'task', 
    timestamp: '2023-08-14T11:30:00Z', 
    summary: 'Created ROI analysis for Acme Corp', 
    entity_id: 'deal-001',
    entity_name: 'Enterprise License - Acme Corp'
  },
  { 
    id: 'act-005', 
    type: 'call', 
    timestamp: '2023-08-14T10:00:00Z', 
    summary: 'Follow-up call with Mike Brown at XYZ LLC', 
    entity_id: 'deal-003',
    entity_name: 'Small Business Package - XYZ LLC'
  }
];

const TOP_OPPORTUNITIES = [
  { 
    id: 'deal-001', 
    name: 'Enterprise License - Acme Corp', 
    value: 75000, 
    probability: 35,
    close_date: '2023-09-15',
    company: 'Acme Corp',
    stage: 'qualified',
    contact: { name: 'John Smith', email: 'john@acmecorp.com', phone: '555-123-4567' }
  },
  { 
    id: 'deal-004', 
    name: 'Annual Renewal - Tech Solutions', 
    value: 95000, 
    probability: 85,
    close_date: '2023-08-30',
    company: 'Tech Solutions',
    stage: 'negotiation',
    contact: { name: 'Lisa Clark', email: 'lisa@techsolutions.com', phone: '555-987-6543' }
  },
  { 
    id: 'deal-002', 
    name: 'Department Rollout - Globex Inc', 
    value: 45000, 
    probability: 65,
    close_date: '2023-09-30',
    company: 'Globex Inc',
    stage: 'proposal',
    contact: { name: 'Sarah Johnson', email: 'sarah@globexinc.com', phone: '555-456-7890' }
  }
];

export const SalesDashboard: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("month");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const toast = useToast();
  
  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsRefreshing(false);
    
    toast({
      title: "Data refreshed",
      description: "Sales dashboard data has been updated",
      status: "success",
      duration: 3000,
      isClosable: true
    });
  };
  
  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Sales Dashboard</Heading>
        
        <Flex align="center">
          <Select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            size="sm"
            width="150px"
            mr={3}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </Select>
          
          <Button
            leftIcon={<FiRefreshCw />}
            size="sm"
            onClick={refreshData}
            isLoading={isRefreshing}
          >
            Refresh
          </Button>
        </Flex>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
          <StatLabel>Sales (MTD)</StatLabel>
          <StatNumber>$285,400</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            23.36%
          </StatHelpText>
        </Stat>
        
        <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
          <StatLabel>Pipeline Total</StatLabel>
          <StatNumber>$362,000</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            12.05%
          </StatHelpText>
        </Stat>
        
        <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
          <StatLabel>Win Rate</StatLabel>
          <StatNumber>36.8%</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            5.2%
          </StatHelpText>
        </Stat>
        
        <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
          <StatLabel>Call Activity</StatLabel>
          <StatNumber>143</StatNumber>
          <StatHelpText>
            <StatArrow type="decrease" />
            3.1%
          </StatHelpText>
        </Stat>
      </SimpleGrid>
      
      <SalesPipeline />
      
      <Tabs mt={8} colorScheme="blue">
        <TabList>
          <Tab>Top Opportunities</Tab>
          <Tab>Activities</Tab>
          <Tab>AI Insights</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel padding={0} pt={4}>
            <Box bg="white" p={4} borderRadius="md" boxShadow="sm">
              <Heading size="md" mb={4}>Top Opportunities</Heading>
              
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Opportunity</Th>
                    <Th>Value</Th>
                    <Th>Stage</Th>
                    <Th>Contact</Th>
                    <Th>Close Date</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {TOP_OPPORTUNITIES.map(opportunity => (
                    <Tr key={opportunity.id}>
                      <Td>
                        <Text fontWeight="bold">{opportunity.name}</Text>
                        <Text fontSize="xs" color="gray.600">{opportunity.company}</Text>
                      </Td>
                      <Td isNumeric>${opportunity.value.toLocaleString()}</Td>
                      <Td>
                        <Badge colorScheme={
                          opportunity.stage === 'negotiation' ? 'orange' :
                          opportunity.stage === 'proposal' ? 'purple' :
                          opportunity.stage === 'qualified' ? 'blue' :
                          'gray'
                        }>
                          {opportunity.stage.charAt(0).toUpperCase() + opportunity.stage.slice(1)}
                        </Badge>
                      </Td>
                      <Td>
                        <Text>{opportunity.contact.name}</Text>
                        <Text fontSize="xs">{opportunity.contact.email}</Text>
                      </Td>
                      <Td>{new Date(opportunity.close_date).toLocaleDateString()}</Td>
                      <Td>
                        <Flex>
                          <Button
                            size="sm"
                            leftIcon={<FiBarChart2 />}
                            colorScheme="blue"
                            variant="outline"
                            mr={2}
                          >
                            Analyze
                          </Button>
                          <VoipCaller 
                            userId={opportunity.contact.name} 
                            userName={opportunity.contact.name} 
                          />
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>
          
          <TabPanel padding={0} pt={4}>
            <Box bg="white" p={4} borderRadius="md" boxShadow="sm">
              <Heading size="md" mb={4}>Recent Activities</Heading>
              
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Type</Th>
                    <Th>Description</Th>
                    <Th>Related To</Th>
                    <Th>Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {RECENT_ACTIVITIES.map(activity => (
                    <Tr key={activity.id}>
                      <Td>
                        <Flex align="center">
                          <Icon 
                            as={
                              activity.type === 'call' ? FiPhone :
                              activity.type === 'meeting' ? FiUsers :
                              activity.type === 'task' ? FiTarget :
                              FiCalendar
                            } 
                            mr={2} 
                            color={
                              activity.type === 'call' ? 'green.500' :
                              activity.type === 'meeting' ? 'blue.500' :
                              activity.type === 'task' ? 'purple.500' :
                              'orange.500'
                            }
                          />
                          {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                        </Flex>
                      </Td>
                      <Td>{activity.summary}</Td>
                      <Td>{activity.entity_name}</Td>
                      <Td>{new Date(activity.timestamp).toLocaleString()}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>
          
          <TabPanel padding={0} pt={4}>
            <Box bg="white" p={4} borderRadius="md" boxShadow="sm">
              <Heading size="md" mb={4}>AI-Powered Sales Insights</Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Box borderWidth="1px" borderRadius="md" p={4}>
                  <Heading size="sm" mb={3}>Opportunity Health</Heading>
                  
                  <Text mb={3}>Based on email sentiment and call analysis, these deals need attention:</Text>
                  
                  <Box as="ul" pl={5}>
                    <Box as="li" mb={2}>
                      <Text fontWeight="bold">Enterprise License - Acme Corp</Text>
                      <Text fontSize="sm">Email responses have slowed and last call revealed pricing concerns</Text>
                    </Box>
                    <Box as="li" mb={2}>
                      <Text fontWeight="bold">Small Business Package - XYZ LLC</Text>
                      <Text fontSize="sm">No engagement in 7 days, risk of competitive loss</Text>
                    </Box>
                  </Box>
                  
                  <Button size="sm" colorScheme="blue" mt={3}>View Detailed Analysis</Button>
                </Box>
                
                <Box borderWidth="1px" borderRadius="md" p={4}>
                  <Heading size="sm" mb={3}>Coaching Insights</Heading>
                  
                  <Text mb={3}>Based on recent calls and successful deals:</Text>
                  
                  <Box as="ul" pl={5}>
                    <Box as="li" mb={2}>
                      <Text fontWeight="bold">Implementation timeline objections increased 35%</Text>
                      <Text fontSize="sm">Recommend preparing case studies showing successful fast deployments</Text>
                    </Box>
                    <Box as="li" mb={2}>
                      <Text fontWeight="bold">ROI discussions drive 28% higher close rates</Text>
                      <Text fontSize="sm">Include ROI calculator in initial demos</Text>
                    </Box>
                  </Box>
                  
                  <Button size="sm" colorScheme="blue" mt={3}>View Coaching Report</Button>
                </Box>
                
                <Box borderWidth="1px" borderRadius="md" p={4}>
                  <Heading size="sm" mb={3}>Deal Forecasting</Heading>
                  
                  <Text mb={3}>AI-based forecast for this quarter:</Text>
                  
                  <Box mb={3}>
                    <Text>Current pipeline: $362,000</Text>
                    <Text>Projected close: $217,200</Text>
                    <Text fontWeight="bold" color="green.500">60% of quarterly target</Text>
                  </Box>
                  
                  <Progress value={60} colorScheme="green" mb={3} />
                  
                  <Button size="sm" colorScheme="blue">View Full Forecast</Button>
                </Box>
                
                <Box borderWidth="1px" borderRadius="md" p={4}>
                  <Heading size="sm" mb={3}>Conversation Intelligence</Heading>
                  
                  <Text mb={3}>From recent sales calls:</Text>
                  
                  <Box as="ul" pl={5}>
                    <Box as="li" mb={2}>
                      <Text fontWeight="bold">Top discussed features</Text>
                      <Flex mt={1} wrap="wrap">
                        <Badge mr={1} mb={1} colorScheme="blue">API Integration</Badge>
                        <Badge mr={1} mb={1} colorScheme="blue">Security</Badge>
                        <Badge mr={1} mb={1} colorScheme="blue">Dashboard</Badge>
                      </Flex>
                    </Box>
                    <Box as="li" mb={2}>
                      <Text fontWeight="bold">Common objections</Text>
                      <Flex mt={1} wrap="wrap">
                        <Badge mr={1} mb={1} colorScheme="red">Price</Badge>
                        <Badge mr={1} mb={1} colorScheme="red">Implementation</Badge>
                      </Flex>
                    </Box>
                  </Box>
                  
                  <Button size="sm" colorScheme="blue" mt={3}>View Call Analysis</Button>
                </Box>
              </SimpleGrid>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}; 