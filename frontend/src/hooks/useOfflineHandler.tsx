import { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '../api/client';

interface OfflineHandlerOptions {
  automaticRetry?: boolean;
  retryInterval?: number;
  maxRetries?: number;
}

interface OfflineAction {
  id: string;
  type: string;
  payload: any;
  attempts: number;
  createdAt: string;
}

export const useOfflineHandler = (
  apiClient: ApiClient,
  options: OfflineHandlerOptions = {}
) => {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
  // Default options
  const mergedOptions = {
    automaticRetry: true,
    retryInterval: 30000, // 30 seconds
    maxRetries: 5,
    ...options
  };
  
  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (mergedOptions.automaticRetry) {
        syncPendingActions();
      }
    };
    
    const handleOffline = () => {
      setIsOffline(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Load pending actions from local storage
    const storedActions = localStorage.getItem('offline_pending_actions');
    if (storedActions) {
      setPendingActions(JSON.parse(storedActions));
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [mergedOptions.automaticRetry]);
  
  // Store pending actions in local storage
  useEffect(() => {
    localStorage.setItem('offline_pending_actions', JSON.stringify(pendingActions));
  }, [pendingActions]);
  
  // Add action to pending queue
  const queueAction = useCallback((type: string, payload: any) => {
    const newAction: OfflineAction = {
      id: Date.now().toString(),
      type,
      payload,
      attempts: 0,
      createdAt: new Date().toISOString()
    };
    
    setPendingActions(prev => [...prev, newAction]);
    return newAction.id;
  }, []);
  
  // Sync all pending actions
  const syncPendingActions = useCallback(async () => {
    if (isOffline || isSyncing || pendingActions.length === 0) {
      return;
    }
    
    setIsSyncing(true);
    const updatedActions = [...pendingActions];
    
    for (let i = 0; i < updatedActions.length; i++) {
      const action = updatedActions[i];
      
      try {
        if (action.attempts >= mergedOptions.maxRetries) {
          // Remove action if max retries reached
          updatedActions.splice(i, 1);
          i--;
          continue;
        }
        
        // Process the action based on type
        switch (action.type) {
          case 'process_media':
            await apiClient.processMedia(
              action.payload.file,
              action.payload.tasks,
              action.payload.options
            );
            break;
            
          case 'save_transcript':
            await apiClient.put(
              `/api/media/transcript/${action.payload.taskId}`,
              action.payload.data
            );
            break;
            
          default:
            console.warn(`Unknown action type: ${action.type}`);
        }
        
        // If successful, remove the action
        updatedActions.splice(i, 1);
        i--;
        
      } catch (error) {
        // Increment attempt count
        updatedActions[i] = {
          ...action,
          attempts: action.attempts + 1
        };
      }
    }
    
    setPendingActions(updatedActions);
    setIsSyncing(false);
  }, [isOffline, isSyncing, pendingActions, apiClient, mergedOptions.maxRetries]);
  
  // Manual sync trigger
  const syncNow = useCallback(() => {
    if (!isOffline) {
      syncPendingActions();
    }
  }, [isOffline, syncPendingActions]);
  
  return {
    isOffline,
    isSyncing,
    pendingActions,
    queueAction,
    syncNow
  };
}; 