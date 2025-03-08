import React from 'react';
import { Box, VStack, Heading, Text, Divider, Icon, Flex, Badge } from '@chakra-ui/react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiHome, FiMic, FiCommand, FiImage, FiPieChart, FiUsers, 
  FiBarChart2, FiLink, FiSettings, FiPhone, FiMessageCircle 
} from 'react-icons/fi';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
  badgeColorScheme?: string;
}

const NavItem: React.FC<NavItemProps> = ({ 
  to, 
  icon, 
  label, 
  badge, 
  badgeColorScheme = "green" 
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Box 
      as={NavLink} 
      to={to}
      display="block" 
      py={2}
      px={4}
      mx={-4}
      borderRadius="md"
      bg={isActive ? "blue.50" : "transparent"}
      color={isActive ? "blue.700" : "gray.700"}
      fontWeight={isActive ? "bold" : "normal"}
      _hover={{ bg: isActive ? "blue.50" : "gray.100" }}
      transition="all 0.2s"
    >
      <Flex align="center">
        <Icon as={icon} boxSize={5} mr={3} />
        <Text fontSize="sm">{label}</Text>
        {badge && (
          <Badge ml="auto" colorScheme={badgeColorScheme} variant="solid" borderRadius="full" fontSize="xx-small">
            {badge}
          </Badge>
        )}
      </Flex>
    </Box>
  );
};

export const Sidebar: React.FC = () => {
  return (
    <Box
      position="fixed"
      left={0}
      top={0}
      bottom={0}
      width="250px"
      bg="white"
      borderRightWidth="1px"
      pt="70px" // Make room for the header
      px={4}
      overflowY="auto"
    >
      <VStack align="stretch" spacing={6}>
        <Box>
          <Heading size="xs" textTransform="uppercase" color="gray.500" mb={3} px={4}>
            Main
          </Heading>
          <VStack align="stretch" spacing={1}>
            <NavItem to="/" icon={FiHome} label="Dashboard" />
            <NavItem to="/marketing" icon={FiPieChart} label="Marketing" badge="New" />
            <NavItem to="/sales" icon={FiBarChart2} label="Sales Pipeline" />
          </VStack>
        </Box>
        
        <Divider />
        
        <Box>
          <Heading size="xs" textTransform="uppercase" color="gray.500" mb={3} px={4}>
            AI Features
          </Heading>
          <VStack align="stretch" spacing={1}>
            <NavItem to="/transcription" icon={FiMic} label="Transcription" />
            <NavItem to="/voice-commands" icon={FiCommand} label="Voice Commands" />
            <NavItem to="/media-enhancer" icon={FiImage} label="Media Enhancer" />
            <NavItem to="/vision-analysis" icon={FiImage} label="Vision Analysis" />
          </VStack>
        </Box>
        
        <Divider />
        
        <Box>
          <Heading size="xs" textTransform="uppercase" color="gray.500" mb={3} px={4}>
            Communication
          </Heading>
          <VStack align="stretch" spacing={1}>
            <NavItem to="/voip-calls" icon={FiPhone} label="VOIP Calls" badge="5" badgeColorScheme="red" />
            <NavItem to="/messaging" icon={FiMessageCircle} label="Messaging" />
            <NavItem to="/contacts" icon={FiUsers} label="Contacts" />
          </VStack>
        </Box>
        
        <Divider />
        
        <Box>
          <Heading size="xs" textTransform="uppercase" color="gray.500" mb={3} px={4}>
            System
          </Heading>
          <VStack align="stretch" spacing={1}>
            <NavItem to="/integrations" icon={FiLink} label="Integrations" />
            <NavItem to="/settings" icon={FiSettings} label="Settings" />
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}; 