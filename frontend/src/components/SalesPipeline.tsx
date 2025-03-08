import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Flex, Badge, Tooltip, Menu, MenuButton,
  MenuList, MenuItem, IconButton, useColorModeValue, useToast,
  Progress, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText,
  StatArrow, Divider, VStack, HStack, Button, Avatar, AvatarGroup
} from '@chakra-ui/react';
import { 
  FiMoreVertical, FiChevronRight, FiPhone, FiMail, FiBarChart2, 
  FiAlertCircle, FiCheck, FiX, FiTag, FiCheckCircle 
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { VoipCaller } from './VoipCaller';

// Demo data
const PIPELINE_STAGES = [
  { id: 'lead', name: 'Lead', color: 'gray' },
  { id: 'qualified', name: 'Qualified', color: 'blue' },
  { id: 'proposal', name: 'Proposal', color: 'purple' },
  { id: 'negotiation', name: 'Negotiation', color: 'orange' },
  { id: 'closed', name: 'Closed Won', color: 'green' }
];

const DEALS = [
  { 
    id: 'deal-001', 
    name: 'Enterprise License - Acme Corp', 
    stage: 'qualified', 
    value: 75000, 
    probability: 35,
    company: 'Acme Corp',
    contact: { id: 'contact-001', name: 'John Smith', role: 'CTO' },
    lastActivity: '2023-08-10T14:30:00Z',
    aiInsights: true,
    objections: ['price', 'implementation_timeline'],
    nextSteps: ['Technical demo', 'ROI analysis']
  },
  { 
    id: 'deal-002', 
    name: 'Department Rollout - Globex Inc', 
    stage: 'proposal', 
    value: 45000, 
    probability: 65,
    company: 'Globex Inc',
    contact: { id: 'contact-002', name: 'Sarah Johnson', role: 'IT Director' },
    lastActivity: '2023-08-09T11:15:00Z',
    aiInsights: true,
    objections: ['integration_complexity'],
    nextSteps: ['Executive presentation']
  },
  { 
    id: 'deal-003', 
    name: 'Small Business Package - XYZ LLC', 
    stage: 'lead', 
    value: 12000, 
    probability: 15,
    company: 'XYZ LLC',
    contact: { id: 'contact-003', name: 'Mike Brown', role: 'CEO' },
    lastActivity: '2023-08-12T09:30:00Z',
    aiInsights: false,
    objections: [],
    nextSteps: ['Initial demo', 'Needs assessment']
  },
  { 
    id: 'deal-004', 
    name: 'Annual Renewal - Tech Solutions', 
    stage: 'negotiation', 
    value: 95000, 
    probability: 85,
    company: 'Tech Solutions',
    contact: { id: 'contact-004', name: 'Lisa Clark', role: 'Procurement' },
    lastActivity: '2023-08-11T13:45:00Z',
    aiInsights: true,
    objections: ['pricing_structure'],
    nextSteps: ['Contract review', 'Final proposal']
  },
  { 
    id: 'deal-005', 
    name: 'Expansion Deal - ABC Corp', 
    stage: 'closed', 
    value: 135000, 
    probability: 100,
    company: 'ABC Corp',
    contact: { id: 'contact-005', name: 'David Wilson', role: 'CIO' },
    lastActivity: '2023-08-05T10:00:00Z',
    aiInsights: true,
    objections: [],
    nextSteps: ['Implementation kickoff']
  },
  { 
    id: 'deal-006', 
    name: 'API Integration Package - Startup Inc', 
    stage: 'qualified', 
    value: 25000, 
    probability: 40,
    company: 'Startup Inc',
    contact: { id: 'contact-006', name: 'Jennifer Adams', role: 'CTO' },
    lastActivity: '2023-08-08T16:20:00Z',
    aiInsights: false,
    objections: ['technical_requirements', 'timeline'],
    nextSteps: ['Technical assessment', 'Demo with engineering team']
  }
];

export const SalesPipeline: React.FC = () => {
  const [expandedDealId, setExpandedDealId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  const [isViewingCalls, setIsViewingCalls] = useState<boolean>(false);
  const [selectedDealCalls, setSelectedDealCalls] = useState<any[]>([]);
  
  const toast = useToast();
  const { getAccessToken } = useAuth();
  
  const toggleExpandDeal = (dealId: string) => {
    if (expandedDealId === dealId) {
      setExpandedDealId(null);
    } else {
      setExpandedDealId(dealId);
    }
  };
  
  const analyzeWithAI = async (dealId: string) => {
    try {
      setIsAnalyzing(true);
      setSelectedDeal(dealId);
      
      // Simulate API call to analyze deal with AI
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis results
      const deal = DEALS.find(d => d.id === dealId);
      
      if (!deal) {
        throw new Error("Deal not found");
      }
      
      const mockAnalysisResult = {
        deal_id: dealId,
        deal_name: deal.name,
        analysis_date: new Date().toISOString(),
        win_probability: Math.min(95, Math.max(5, deal.probability + Math.floor((Math.random() * 20) - 10))),
        sentiment: Math.random() > 0.7 ? "positive" : Math.random() > 0.3 ? "neutral" : "negative",
        key_topics: ["pricing", "implementation", "support", "timeline", "features"]
          .sort(() => 0.5 - Math.random()).slice(0, 3),
        detected_objections: deal.objections.length > 0 ? deal.objections : 
          ["pricing", "timeline", "technical_complexity", "resource_requirements", "competition"]
            .sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3)),
        recommended_actions: [
          "Send detailed ROI analysis",
          "Schedule technical demo",
          "Involve executive sponsor",
          "Provide customer testimonials",
          "Clarify implementation timeline"
        ].sort(() => 0.5 - Math.random()).slice(0, 3),
        similar_won_deals: DEALS.filter(d => d.stage === "closed")
          .map(d => ({ id: d.id, name: d.name, company: d.company, value: d.value }))
          .sort(() => 0.5 - Math.random()).slice(0, 2),
        risk_assessment: {
          overall_risk: Math.random() > 0.6 ? "low" : Math.random() > 0.3 ? "medium" : "high",
          competition_risk: Math.floor(Math.random() * 100),
          price_sensitivity: Math.floor(Math.random() * 100),
          timeline_concerns: Math.floor(Math.random() * 100)
        }
      };
      
      // Update deal with AI insights
      // In a real app, this would come from the API
      deal.aiInsights = true;
      
      toast({
        title: "Analysis Complete",
        description: `AI analysis for ${deal.name} is ready`,
        status: "success",
        duration: 5000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error analyzing deal:', error);
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
  
  const viewCallHistory = async (dealId: string) => {
    try {
      setIsViewingCalls(true);
      setSelectedDeal(dealId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock call history
      const mockCalls = [
        {
          id: `call-${dealId}-1`,
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          duration: 1245,
          participants: ["John Doe", "Sarah Johnson"],
          recording_url: "https://example.com/recording1.mp3",
          transcription_available: true,
          sentiment: "positive",
          topics: ["pricing", "features", "timeline"],
          next_steps: ["Schedule technical demo", "Send price quote"]
        },
        {
          id: `call-${dealId}-2`,
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
          duration: 895,
          participants: ["John Doe", "Sarah Johnson", "Mike Technical"],
          recording_url: "https://example.com/recording2.mp3",
          transcription_available: true,
          sentiment: "neutral",
          topics: ["requirements", "integration", "support"],
          next_steps: ["Share documentation", "Arrange IT meeting"]
        }
      ];
      
      setSelectedDealCalls(mockCalls);
      
    } catch (error) {
      console.error('Error fetching call history:', error);
      toast({
        title: "Fetch Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsViewingCalls(false);
    }
  };
  
  // Calculate stage values
  const stageValues = PIPELINE_STAGES.map(stage => {
    const stageDeals = DEALS.filter(deal => deal.stage === stage.id);
    const totalValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
    const weightedValue = stageDeals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);
    return {
      ...stage,
      deals: stageDeals,
      totalValue,
      weightedValue,
      count: stageDeals.length
    };
  });
  
  const totalPipelineValue = stageValues.reduce((sum, stage) => sum + stage.totalValue, 0);
  const totalWeightedValue = stageValues.reduce((sum, stage) => sum + stage.weightedValue, 0);
  
  return (
    <Box p={5}>
      <Heading mb={6}>Sales Pipeline</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
          <StatLabel>Pipeline Value</StatLabel>
          <StatNumber>${totalPipelineValue.toLocaleString()}</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            15.3%
          </StatHelpText>
        </Stat>
        
        <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
          <StatLabel>Weighted Value</StatLabel>
          <StatNumber>${totalWeightedValue.toLocaleString()}</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            8.2%
          </StatHelpText>
        </Stat>
        
        <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
          <StatLabel>Active Deals</StatLabel>
          <StatNumber>{DEALS.length}</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            3
          </StatHelpText>
        </Stat>
        
        <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
          <StatLabel>Win Rate</StatLabel>
          <StatNumber>38%</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            5.2%
          </StatHelpText>
        </Stat>
      </SimpleGrid>
      
      <Box bg="white" p={4} borderRadius="md" boxShadow="sm" mb={8} overflowX="auto">
        <Flex minWidth="fit-content">
          {stageValues.map((stage, index) => (
            <Box 
              key={stage.id} 
              flex="1" 
              minWidth="250px"
              borderRight={index < stageValues.length - 1 ? "1px solid" : "none"}
              borderColor="gray.200"
              p={3}
            >
              <Flex justify="space-between" align="center" mb={3}>
                <Heading size="sm">
                  <Badge colorScheme={stage.color} mr={2}>{stage.count}</Badge>
                  {stage.name}
                </Heading>
                <Text color="gray.500" fontSize="sm">${stage.totalValue.toLocaleString()}</Text>
              </Flex>
              
              <VStack spacing={4} align="stretch">
                {stage.deals.map(deal => (
                  <Box 
                    key={deal.id} 
                    borderWidth="1px" 
                    borderRadius="md" 
                    p={3}
                    bg={expandedDealId === deal.id ? "blue.50" : "white"}
                  >
                    <Flex justify="space-between" align="center" mb={2}>
                      <Heading size="xs" noOfLines={1} title={deal.name}>
                        {deal.name}
                      </Heading>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="xs"
                          aria-label="Options"
                        />
                        <MenuList>
                          <MenuItem onClick={() => toggleExpandDeal(deal.id)}>
                            {expandedDealId === deal.id ? "Collapse" : "Expand"}
                          </MenuItem>
                          <MenuItem onClick={() => viewCallHistory(deal.id)}>View Calls</MenuItem>
                          <MenuItem onClick={() => analyzeWithAI(deal.id)}>Analyze with AI</MenuItem>
                        </MenuList>
                      </Menu>
                    </Flex>
                    
                    <Text fontSize="xs" color="gray.600" mb={2}>{deal.company}</Text>
                    
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontWeight="bold" fontSize="sm">${deal.value.toLocaleString()}</Text>
                      <Badge colorScheme={deal.probability > 70 ? "green" : deal.probability > 40 ? "yellow" : "red"}>
                        {deal.probability}%
                      </Badge>
                    </Flex>
                    
                    {expandedDealId === deal.id && (
                      <Box mt={3}>
                        <Divider mb={3} />
                        
                        <Flex align="center" mb={2}>
                          <Avatar size="xs" name={deal.contact.name} mr={2} />
                          <Box>
                            <Text fontSize="xs" fontWeight="bold">{deal.contact.name}</Text>
                            <Text fontSize="xs" color="gray.600">{deal.contact.role}</Text>
                          </Box>
                          <HStack ml="auto" spacing={1}>
                            <Tooltip label="Call Contact">
                              <IconButton 
                                icon={<FiPhone />} 
                                size="xs" 
                                aria-label="Call" 
                                variant="ghost" 
                              />
                            </Tooltip>
                            <Tooltip label="Email Contact">
                              <IconButton 
                                icon={<FiMail />} 
                                size="xs" 
                                aria-label="Email" 
                                variant="ghost" 
                              />
                            </Tooltip>
                          </HStack>
                        </Flex>
                        
                        {deal.objections.length > 0 && (
                          <Box mb={2}>
                            <Text fontSize="xs" fontWeight="bold">Objections:</Text>
                            <Flex wrap="wrap" mt={1}>
                              {deal.objections.map((obj, i) => (
                                <Badge key={i} mr={1} mb={1} colorScheme="red" variant="outline" fontSize="xs">
                                  {obj.replace('_', ' ')}
                                </Badge>
                              ))}
                            </Flex>
                          </Box>
                        )}
                        
                        <Box mb={2}>
                          <Text fontSize="xs" fontWeight="bold">Next Steps:</Text>
                          <VStack align="start" spacing={1} mt={1}>
                            {deal.nextSteps.map((step, i) => (
                              <Flex key={i} align="center">
                                <Icon as={FiCheckCircle} color="green.500" mr={1} boxSize={3} />
                                <Text fontSize="xs">{step}</Text>
                              </Flex>
                            ))}
                          </VStack>
                        </Box>
                        
                        <Flex justify="space-between" mt={3}>
                          <Button 
                            leftIcon={<FiPhone />} 
                            size="xs" 
                            colorScheme="green"
                            onClick={() => viewCallHistory(deal.id)}
                          >
                            Call History
                          </Button>
                          <Button 
                            leftIcon={<FiBarChart2 />} 
                            size="xs" 
                            colorScheme="blue"
                            onClick={() => analyzeWithAI(deal.id)}
                            isLoading={isAnalyzing && selectedDeal === deal.id}
                          >
                            AI Analysis
                          </Button>
                        </Flex>
                      </Box>
                    )}
                    
                    {deal.aiInsights && !expandedDealId && (
                      <Badge colorScheme="purple" mt={2} size="sm">
                        AI Insights Available
                      </Badge>
                    )}
                    
                  </Box>
                ))}
              </VStack>
            </Box>
          ))}
        </Flex>
      </Box>
      
      {selectedDeal && selectedDealCalls.length > 0 && (
        <Box bg="white" p={4} borderRadius="md" boxShadow="sm" mb={8}>
          <Heading size="md" mb={4}>
            Call History for {DEALS.find(d => d.id === selectedDeal)?.name}
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {selectedDealCalls.map(call => (
              <Box 
                key={call.id} 
                borderWidth="1px" 
                borderRadius="md" 
                p={4}
              >
                <Flex justify="space-between" align="center" mb={3}>
                  <Box>
                    <Text fontWeight="bold">
                      {new Date(call.date).toLocaleDateString()} at {new Date(call.date).toLocaleTimeString()}
                    </Text>
                    <Text fontSize="sm">
                      Duration: {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}
                    </Text>
                  </Box>
                  <Badge colorScheme={
                    call.sentiment === "positive" ? "green" : 
                    call.sentiment === "negative" ? "red" : "gray"
                  }>
                    {call.sentiment}
                  </Badge>
                </Flex>
                
                <Text fontSize="sm" fontWeight="bold" mb={1}>Participants:</Text>
                <Flex mb={3}>
                  <AvatarGroup size="xs" max={3}>
                    {call.participants.map((p, i) => (
                      <Avatar key={i} name={p} />
                    ))}
                  </AvatarGroup>
                  <Text fontSize="sm" ml={2}>
                    {call.participants.join(', ')}
                  </Text>
                </Flex>
                
                <Text fontSize="sm" fontWeight="bold" mb={1}>Topics Discussed:</Text>
                <Flex wrap="wrap" mb={3}>
                  {call.topics.map((topic, i) => (
                    <Badge key={i} mr={1} mb={1} colorScheme="blue" variant="subtle">
                      {topic}
                    </Badge>
                  ))}
                </Flex>
                
                <Text fontSize="sm" fontWeight="bold" mb={1}>Next Steps:</Text>
                <VStack align="start" spacing={1} mb={3}>
                  {call.next_steps.map((step, i) => (
                    <Flex key={i} align="center">
                      <Icon as={FiCheck} color="green.500" mr={1} boxSize={3} />
                      <Text fontSize="sm">{step}</Text>
                    </Flex>
                  ))}
                </VStack>
                
                <Flex justify="space-between" mt={3}>
                  <Button size="sm" leftIcon={<FiBarChart2 />} colorScheme="blue" variant="outline">
                    View Transcript
                  </Button>
                  <Button size="sm" leftIcon={<FiPhone />} colorScheme="green">
                    Play Recording
                  </Button>
                </Flex>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      )}
    </Box>
  );
}; 