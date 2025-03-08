import React, { useState, useEffect } from 'react';
import { 
  Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, 
  StatArrow, Flex, Text, Button, VStack, HStack, Progress, 
  Table, Thead, Tbody, Tr, Th, Td, Badge, useToast, Select, 
  Tabs, TabList, TabPanels, Tab, TabPanel, Icon, Divider
} from '@chakra-ui/react';
import { FiPhone, FiMail, FiBarChart2, FiTrendingUp, FiList, FiUsers, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { VoipCaller } from '../components/VoipCaller';

// Demo data
const DEMO_CAMPAIGNS = [
  { id: 'cam-001', name: 'Q3 Product Launch', type: 'email', status: 'active', leads: 245, conversion: 3.2 },
  { id: 'cam-002', name: 'Summer Webinar Series', type: 'webinar', status: 'active', leads: 189, conversion: 5.7 },
  { id: 'cam-003', name: 'LinkedIn Premium', type: 'social', status: 'completed', leads: 312, conversion: 2.8 },
  { id: 'cam-004', name: 'Industry Conference', type: 'event', status: 'planned', leads: 0, conversion: 0 }
];

const DEMO_LEADS = [
  { id: 'lead-001', name: 'John Smith', company: 'Acme Corp', score: 85, source: 'webinar', status: 'qualified' },
  { id: 'lead-002', name: 'Sarah Johnson', company: 'Globex Inc', score: 73, source: 'website', status: 'nurturing' },
  { id: 'lead-003', name: 'Mike Williams', company: 'ABC Solutions', score: 92, source: 'referral', status: 'qualified' },
  { id: 'lead-004', name: 'Lisa Brown', company: 'Tech Systems', score: 45, source: 'email', status: 'new' },
  { id: 'lead-005', name: 'David Clark', company: 'Innovative Ltd', score: 67, source: 'social', status: 'nurturing' }
];

const DEMO_CALL_RECORDINGS = [
  { 
    recording_url: 'https://example.com/recording1.mp3', 
    call_id: 'call-001',
    duration: 320,
    timestamp: '2023-08-10T14:30:00Z'
  },
  { 
    recording_url: 'https://example.com/recording2.mp3', 
    call_id: 'call-002',
    duration: 540,
    timestamp: '2023-08-09T11:15:00Z'
  },
  { 
    recording_url: 'https://example.com/recording3.mp3', 
    call_id: 'call-003',
    duration: 410,
    timestamp: '2023-08-08T16:45:00Z'
  }
];

export const MarketingDashboard: React.FC = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [campaignAnalysis, setCampaignAnalysis] = useState<any>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const toast = useToast();
  const { getAccessToken } = useAuth();
  
  const analyzeCampaign = async () => {
    if (!selectedCampaign) {
      toast({
        title: "No Campaign Selected",
        description: "Please select a campaign to analyze",
        status: "warning",
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    try {
      setIsAnalyzing(true);
      
      // Find the selected campaign
      const campaign = DEMO_CAMPAIGNS.find(c => c.id === selectedCampaign);
      if (!campaign) throw new Error("Campaign not found");
      
      // Prepare analysis request
      const requestData = {
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        campaign_type: campaign.type,
        date_range: {
          start: "2023-07-01",
          end: "2023-08-15"
        },
        call_recordings: DEMO_CALL_RECORDINGS
      };
      
      // Send request to backend (simulated for demo)
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Mock response data
      const mockAnalysisResult = {
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        campaign_type: campaign.type,
        analyses: {
          call_recordings: {
            call_analyses: DEMO_CALL_RECORDINGS.map(call => ({
              call_id: call.call_id,
              duration: call.duration,
              sentiment: {
                overall: ["positive", "neutral", "negative"][Math.floor(Math.random() * 3)],
                score: 0.5 + (Math.random() * 0.5),
                confidence: 0.7 + (Math.random() * 0.2)
              },
              topics: ["pricing", "features", "support", "implementation", "competitors", "timeline"]
                .sort(() => 0.5 - Math.random()).slice(0, 3),
              outcome: {
                category: Math.random() > 0.7 ? "qualified_lead" : "interested",
                next_steps: "schedule_demo",
                objections: ["price", "implementation_time"],
                confidence: 0.7 + (Math.random() * 0.2)
              },
              lead_score: {
                score: 50 + Math.floor(Math.random() * 50),
                tier: Math.random() > 0.7 ? "A" : Math.random() > 0.4 ? "B" : "C",
                conversion_probability: 0.4 + (Math.random() * 0.5)
              }
            })),
            summary: {
              qualified_lead_rate: 0.35 + (Math.random() * 0.2),
              average_lead_score: 65 + (Math.random() * 20),
              sentiment_distribution: {
                positive: Math.floor(Math.random() * 10),
                neutral: Math.floor(Math.random() * 10),
                negative: Math.floor(Math.random() * 5)
              },
              top_topics: [
                ["pricing", 5 + Math.floor(Math.random() * 5)],
                ["features", 3 + Math.floor(Math.random() * 5)],
                ["competitors", 2 + Math.floor(Math.random() * 3)]
              ],
              total_analyzed: DEMO_CALL_RECORDINGS.length,
              conversion_projection: Math.floor(Math.random() * 10)
            }
          }
        },
        performance_prediction: {
          engagement_score: 7 + (Math.random() * 2.5),
          conversion_rate_estimate: 0.03 + (Math.random() * 0.04),
          roi_prediction: 2.5 + (Math.random() * 1.5),
          recommended_improvements: [
            "Increase call-to-action visibility",
            "Test alternative headline for email campaign",
            "Optimize landing page form length"
          ]
        }
      };
      
      setCampaignAnalysis(mockAnalysisResult);
      
      toast({
        title: "Analysis Complete",
        description: `Analysis for ${campaign.name} is complete`,
        status: "success",
        duration: 3000,
        isClosable: true
      });
      
    } catch (error) {
      console.error('Error analyzing campaign:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const getSelectedLead = () => {
    if (!selectedLeadId) return null;
    return DEMO_LEADS.find(lead => lead.id === selectedLeadId) || null;
  };
  
  const selectedLead = getSelectedLead();
  
  return (
    <Box p={5}>
      <Heading mb={6}>Marketing Dashboard</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
          <StatLabel>Total Leads</StatLabel>
          <StatNumber>746</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            12.5%
          </StatHelpText>
        </Stat>
        
        <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
          <StatLabel>Conversion Rate</StatLabel>
          <StatNumber>3.8%</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            0.7%
          </StatHelpText>
        </Stat>
        
        <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
          <StatLabel>Active Campaigns</StatLabel>
          <StatNumber>3</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            1
          </StatHelpText>
        </Stat>
        
        <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
          <StatLabel>Call Engagement</StatLabel>
          <StatNumber>85%</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            7%
          </StatHelpText>
        </Stat>
      </SimpleGrid>
      
      <Tabs variant="enclosed" mb={8}>
        <TabList>
          <Tab><Icon as={FiBarChart2} mr={2} /> Campaign Analysis</Tab>
          <Tab><Icon as={FiUsers} mr={2} /> Lead Management</Tab>
          <Tab><Icon as={FiPhone} mr={2} /> Call Center</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
              <Box bg="white" p={4} borderRadius="md" boxShadow="sm">
                <Heading size="md" mb={4}>Campaign Performance</Heading>
                
                <HStack mb={4}>
                  <Select 
                    placeholder="Select campaign to analyze" 
                    value={selectedCampaign}
                    onChange={e => setSelectedCampaign(e.target.value)}
                  >
                    {DEMO_CAMPAIGNS.map(campaign => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </option>
                    ))}
                  </Select>
                  <Button 
                    colorScheme="blue" 
                    onClick={analyzeCampaign}
                    isLoading={isAnalyzing}
                    loadingText="Analyzing"
                  >
                    Analyze
                  </Button>
                </HStack>
                
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Campaign</Th>
                      <Th>Type</Th>
                      <Th isNumeric>Leads</Th>
                      <Th isNumeric>Conv. Rate</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {DEMO_CAMPAIGNS.map(campaign => (
                      <Tr key={campaign.id} bg={selectedCampaign === campaign.id ? "blue.50" : undefined}>
                        <Td>{campaign.name}</Td>
                        <Td>{campaign.type}</Td>
                        <Td isNumeric>{campaign.leads}</Td>
                        <Td isNumeric>{campaign.conversion}%</Td>
                        <Td>
                          <Badge colorScheme={
                            campaign.status === 'active' ? 'green' : 
                            campaign.status === 'completed' ? 'gray' : 'yellow'
                          }>
                            {campaign.status}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              
              {campaignAnalysis && (
                <Box bg="white" p={4} borderRadius="md" boxShadow="sm">
                  <Heading size="md" mb={4}>AI Analysis Results</Heading>
                  
                  <VStack align="start" spacing={3}>
                    <Box>
                      <Text fontWeight="bold">Campaign: {campaignAnalysis.campaign_name}</Text>
                      <Text fontSize="sm">Type: {campaignAnalysis.campaign_type}</Text>
                    </Box>
                    
                    <Divider />
                    
                    <Box>
                      <Heading size="sm" mb={2}>Performance Prediction</Heading>
                      <SimpleGrid columns={2} spacing={3}>
                        <Stat size="sm">
                          <StatLabel>Engagement Score</StatLabel>
                          <StatNumber>{campaignAnalysis.performance_prediction.engagement_score.toFixed(1)}/10</StatNumber>
                        </Stat>
                        <Stat size="sm">
                          <StatLabel>Conv. Rate</StatLabel>
                          <StatNumber>{(campaignAnalysis.performance_prediction.conversion_rate_estimate * 100).toFixed(1)}%</StatNumber>
                        </Stat>
                        <Stat size="sm">
                          <StatLabel>ROI Prediction</StatLabel>
                          <StatNumber>{campaignAnalysis.performance_prediction.roi_prediction.toFixed(1)}x</StatNumber>
                        </Stat>
                      </SimpleGrid>
                    </Box>
                    
                    <Divider />
                    
                    <Box>
                      <Heading size="sm" mb={2}>Call Analysis</Heading>
                      <Text fontSize="sm"><strong>Qualified Lead Rate:</strong> {(campaignAnalysis.analyses.call_recordings.summary.qualified_lead_rate * 100).toFixed(1)}%</Text>
                      <Text fontSize="sm"><strong>Average Lead Score:</strong> {campaignAnalysis.analyses.call_recordings.summary.average_lead_score.toFixed(1)}</Text>
                      <Text fontSize="sm"><strong>Top Topics Mentioned:</strong></Text>
                      <HStack mt={1}>
                        {campaignAnalysis.analyses.call_recordings.summary.top_topics.map((topic, i) => (
                          <Badge key={i} colorScheme="blue" mr={1}>{topic[0]} ({topic[1]})</Badge>
                        ))}
                      </HStack>
                    </Box>
                    
                    <Divider />
                    
                    <Box>
                      <Heading size="sm" mb={2}>Recommended Improvements</Heading>
                      <VStack align="start" spacing={1}>
                        {campaignAnalysis.performance_prediction.recommended_improvements.map((improvement, i) => (
                          <Text key={i} fontSize="sm">• {improvement}</Text>
                        ))}
                      </VStack>
                    </Box>
                  </VStack>
                </Box>
              )}
            </SimpleGrid>
          </TabPanel>
          
          <TabPanel>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
              <Box bg="white" p={4} borderRadius="md" boxShadow="sm">
                <Heading size="md" mb={4}>Lead Scoring</Heading>
                
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Company</Th>
                      <Th isNumeric>Score</Th>
                      <Th>Source</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {DEMO_LEADS.map(lead => (
                      <Tr 
                        key={lead.id} 
                        cursor="pointer"
                        onClick={() => setSelectedLeadId(lead.id)}
                        bg={selectedLeadId === lead.id ? "blue.50" : undefined}
                      >
                        <Td>{lead.name}</Td>
                        <Td>{lead.company}</Td>
                        <Td isNumeric>
                          <Badge 
                            colorScheme={lead.score >= 80 ? "green" : lead.score >= 60 ? "blue" : "gray"}
                          >
                            {lead.score}
                          </Badge>
                        </Td>
                        <Td>{lead.source}</Td>
                        <Td>
                          <Badge 
                            colorScheme={
                              lead.status === 'qualified' ? 'green' : 
                              lead.status === 'nurturing' ? 'blue' : 'gray'
                            }
                          >
                            {lead.status}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              
              {selectedLead && (
                <Box bg="white" p={4} borderRadius="md" boxShadow="sm">
                  <Heading size="md" mb={4}>Lead Details: {selectedLead.name}</Heading>
                  
                  <SimpleGrid columns={2} spacing={4} mb={4}>
                    <Box>
                      <Text fontWeight="bold">{selectedLead.name}</Text>
                      <Text fontSize="sm">{selectedLead.company}</Text>
                    </Box>
                    <Box>
                      <Heading size="sm" mb={1}>Lead Score</Heading>
                      <HStack>
                        <Progress 
                          value={selectedLead.score} 
                          max={100} 
                          colorScheme={selectedLead.score >= 80 ? "green" : selectedLead.score >= 60 ? "blue" : "gray"}
                          flex="1"
                        />
                        <Text fontWeight="bold">{selectedLead.score}</Text>
                      </HStack>
                    </Box>
                  </SimpleGrid>
                  
                  <Box mb={4}>
                    <Heading size="sm" mb={2}>Activities</Heading>
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm">• Visited pricing page (2 days ago)</Text>
                      <Text fontSize="sm">• Downloaded whitepaper (5 days ago)</Text>
                      <Text fontSize="sm">• Attended webinar (2 weeks ago)</Text>
                    </VStack>
                  </Box>
                  
                  <Box mb={4}>
                    <Heading size="sm" mb={2}>Recommended Next Steps</Heading>
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm" fontWeight="bold">
                        {selectedLead.score >= 80 
                          ? "• Schedule sales call" 
                          : selectedLead.score >= 60 
                            ? "• Send product demo invitation" 
                            : "• Include in nurture campaign"}
                      </Text>
                      <Text fontSize="sm">• Send personalized follow-up email</Text>
                    </VStack>
                  </Box>
                  
                  <Flex justify="space-between">
                    <Button leftIcon={<FiMail />} colorScheme="blue" size="sm">
                      Send Email
                    </Button>
                    <VoipCaller userId={selectedLead.id} userName={selectedLead.name} />
                  </Flex>
                </Box>
              )}
            </SimpleGrid>
          </TabPanel>
          
          <TabPanel>
            <Box bg="white" p={4} borderRadius="md" boxShadow="sm">
              <Heading size="md" mb={4}>Recent Call Recordings</Heading>
              
              <Table variant="simple" size="sm" mb={4}>
                <Thead>
                  <Tr>
                    <Th>Call ID</Th>
                    <Th>Duration</Th>
                    <Th>Date</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {DEMO_CALL_RECORDINGS.map(call => (
                    <Tr key={call.call_id}>
                      <Td>{call.call_id}</Td>
                      <Td>{Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}</Td>
                      <Td>{new Date(call.timestamp).toLocaleDateString()}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button size="xs" colorScheme="blue">Analyze</Button>
                          <Button size="xs">Play</Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              
              <Heading size="sm" mb={3}>Start New Call</Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {DEMO_LEADS.slice(0, 3).map(lead => (
                  <Box key={lead.id} p={3} borderWidth="1px" borderRadius="md">
                    <Text fontWeight="bold">{lead.name}</Text>
                    <Text fontSize="xs" mb={2}>{lead.company}</Text>
                    <VoipCaller userId={lead.id} userName={lead.name} />
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}; 