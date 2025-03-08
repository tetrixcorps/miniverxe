import React, { useEffect, useState } from 'react';
import { useOfflineHandler } from '../hooks/useOfflineHandler';
import '../styles/OfflineIndicator.css';
import { Box, Flex, Text, Button, useToast } from '@chakra-ui/react';
import { WarningIcon, RepeatIcon } from '@chakra-ui/icons';

interface OfflineIndicatorProps {
  customText?: string;
  showPendingTasks?: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  customText,
  showPendingTasks = true,
}) => {
  const { isOffline, offlineTasks, syncOfflineTasks, retryFailedTasks } = useOfflineHandler();
  const toast = useToast();
  const [visible, setVisible] = useState<boolean>(!isOffline);
  const [minimized, setMinimized] = useState<boolean>(false);

  // Show/hide the indicator based on online status
  useEffect(() => {
    if (!isOffline) {
      setVisible(true);
      setMinimized(false);
    } else if (offlineTasks.length > 0) {
      setVisible(true);
    } else {
      // If we're online and have no pending requests, hide after a delay
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOffline, offlineTasks.length]);

  if (!visible) {
    return null;
  }

  const pendingCount = offlineTasks.filter(task => task.status === 'pending').length;
  const failedCount = offlineTasks.filter(task => task.status === 'failed').length;
  
  const handleRetry = () => {
    if (isOffline) {
      toast({
        title: "Still offline",
        description: "You're still offline. Tasks will sync automatically when connection is restored.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (failedCount > 0) {
      retryFailedTasks();
      toast({
        title: "Retrying failed tasks",
        description: `Retrying ${failedCount} failed tasks...`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } else {
      syncOfflineTasks();
      toast({
        title: "Syncing tasks",
        description: `Syncing ${pendingCount} pending tasks...`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleToggleMinimize = () => {
    setMinimized(!minimized);
  };

  return (
    <Box 
      position="fixed" 
      bottom="0" 
      left="0" 
      right="0" 
      bg={isOffline ? "orange.500" : "blue.500"} 
      color="white"
      py={2}
      px={4}
      zIndex={1000}
    >
      <Flex justify="space-between" align="center">
        <Flex align="center">
          <WarningIcon mr={2} />
          <Text fontWeight="bold">
            {isOffline 
              ? `You're offline. ${pendingCount} tasks will sync when connection is restored.` 
              : `You're back online. ${pendingCount} tasks waiting to sync.`}
            {failedCount > 0 && ` (${failedCount} failed)`}
          </Text>
        </Flex>
        
        {!isOffline && (
          <Button 
            size="sm" 
            leftIcon={<RepeatIcon />} 
            colorScheme="whiteAlpha" 
            onClick={handleRetry}
          >
            {failedCount > 0 ? "Retry Failed" : "Sync Now"}
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default OfflineIndicator; 