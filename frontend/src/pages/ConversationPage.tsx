import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import ConversationPanel from '../components/conversation/ConversationPanel';

const ConversationPage: React.FC = () => {
  return (
    <Box p={4}>
      <Heading as="h1" size="lg" mb={2}>AI Conversation</Heading>
      <Text mb={4}>Have a conversation with our AI assistant in any language.</Text>
      <ConversationPanel />
    </Box>
  );
};

export default ConversationPage; 