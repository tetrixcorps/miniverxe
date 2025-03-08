import { useState, useEffect, useCallback, useRef } from 'react';
import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';

interface OfflineQueueItem {
  id: string;
  method: string;
  url: string;
  data?: any;
  headers?: Record<string, string>;
  timestamp: number;
  attempts: number;
  maxRetries: number;
}

interface OfflineTask {
  id: string;
  type: string;
  data: any;
  createdAt: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  error?: string;
  result?: any;
}

interface OfflineHandlerOptions {
  queueStorageName?: string;
  retryInterval?: number;
  maxRetries?: number;
  onGoOffline?: () => void;
  onGoOnline?: () => void;
}

export const useOfflineHandler = (options: OfflineHandlerOptions = {}) => {
  const {
    queueStorageName = 'offlineRequestQueue',
    retryInterval = 30000, // 30 seconds
    maxRetries = 5,
    onGoOffline,
    onGoOnline,
  } = options;

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingRequests, setPendingRequests] = useState<number>(0);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const offlineStorage = localforage.createInstance({
    name: queueStorageName,
  });
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [offlineTasks, setOfflineTasks] = useState<OfflineTask[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Update online status
  const updateOnlineStatus = useCallback(() => {
    const online = navigator.onLine;
    if (online !== isOnline) {
      setIsOnline(online);
      if (online) {
        console.log('🌐 Connection restored');
        onGoOnline?.();
        processQueue();
      } else {
        console.log('⚠️ Connection lost');
        onGoOffline?.();
      }
    }
  }, [isOnline, onGoOffline, onGoOnline]);

  // Initialize event listeners
  useEffect(() => {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Initial queue count
    updateQueueCount();

    // Load offline tasks from localStorage on init
    const storedTasks = localStorage.getItem('offline_tasks');
    if (storedTasks) {
      try {
        setOfflineTasks(JSON.parse(storedTasks));
      } catch (e) {
        console.error('Failed to parse offline tasks:', e);
        localStorage.removeItem('offline_tasks');
      }
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, [updateOnlineStatus]);

  // Update the pending requests count
  const updateQueueCount = async () => {
    try {
      const keys = await offlineStorage.keys();
      setPendingRequests(keys.length);
    } catch (error) {
      console.error('Error counting pending requests:', error);
    }
  };

  // Queue a request for when back online
  const queueRequest = async (
    method: string,
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<string> => {
    const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const queueItem: OfflineQueueItem = {
      id,
      method,
      url,
      data,
      headers,
      timestamp: Date.now(),
      attempts: 0,
      maxRetries,
    };

    try {
      await offlineStorage.setItem(id, queueItem);
      console.log(`🔄 Request queued for later: ${method} ${url}`);
      updateQueueCount();
      return id;
    } catch (error) {
      console.error('Error queuing request:', error);
      throw error;
    }
  };

  // Process the queued requests
  const processQueue = async () => {
    if (!navigator.onLine) {
      console.log('Still offline, cannot process queue');
      return;
    }

    try {
      const keys = await offlineStorage.keys();
      
      if (keys.length === 0) {
        return;
      }

      console.log(`🔄 Processing ${keys.length} queued requests`);

      for (const key of keys) {
        const queueItem = await offlineStorage.getItem<OfflineQueueItem>(key);
        
        if (!queueItem) {
          continue;
        }

        // Increment attempt count
        queueItem.attempts += 1;
        
        // Skip if too many retries
        if (queueItem.attempts > queueItem.maxRetries) {
          console.warn(`⚠️ Request ${key} exceeded max retries, removing from queue`);
          await offlineStorage.removeItem(key);
          updateQueueCount();
          continue;
        }

        try {
          const response = await fetch(queueItem.url, {
            method: queueItem.method,
            headers: {
              'Content-Type': 'application/json',
              ...queueItem.headers,
            },
            body: queueItem.data ? JSON.stringify(queueItem.data) : undefined,
          });

          if (response.ok) {
            console.log(`✅ Successfully processed queued request: ${queueItem.method} ${queueItem.url}`);
            await offlineStorage.removeItem(key);
            updateQueueCount();
          } else {
            console.warn(`❌ Queue request failed: ${queueItem.method} ${queueItem.url} - ${response.status}`);
            await offlineStorage.setItem(key, queueItem);
          }
        } catch (requestError) {
          console.error(`❌ Error processing queued request: ${queueItem.method} ${queueItem.url}`, requestError);
          await offlineStorage.setItem(key, queueItem);
          // If request failed, we might be offline again
          if (navigator.onLine) {
            scheduleRetry();
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error processing queue:', error);
    }
  };

  // Schedule retry for failed requests
  const scheduleRetry = () => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
    }
    
    retryTimerRef.current = setTimeout(() => {
      if (navigator.onLine) {
        processQueue();
      }
    }, retryInterval);
  };

  // Clear the queue
  const clearQueue = async () => {
    try {
      await offlineStorage.clear();
      updateQueueCount();
      console.log('🧹 Request queue cleared');
    } catch (error) {
      console.error('Error clearing queue:', error);
    }
  };

  // Execute request with offline caching
  const executeRequest = async <T = any>(
    method: string,
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<{ data: T | null; queued: boolean; requestId?: string }> => {
    // If offline, queue the request
    if (!navigator.onLine) {
      const requestId = await queueRequest(method, url, data, headers);
      return { data: null, queued: true, requestId };
    }

    // We're online, try the request
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (response.ok) {
        const responseData = await response.json();
        return { data: responseData, queued: false };
      } else {
        // Request failed with error status
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      // Network error, queue the request
      console.error('Network error, queueing request', error);
      const requestId = await queueRequest(method, url, data, headers);
      return { data: null, queued: true, requestId };
    }
  };

  // Convenience methods
  const get = <T = any>(url: string, headers?: Record<string, string>) => 
    executeRequest<T>('GET', url, undefined, headers);
    
  const post = <T = any>(url: string, data?: any, headers?: Record<string, string>) => 
    executeRequest<T>('POST', url, data, headers);
    
  const put = <T = any>(url: string, data?: any, headers?: Record<string, string>) => 
    executeRequest<T>('PUT', url, data, headers);
    
  const del = <T = any>(url: string, headers?: Record<string, string>) => 
    executeRequest<T>('DELETE', url, undefined, headers);

  // Queue a task for offline processing
  const queueOfflineTask = useCallback((type: string, data: any): string => {
    const taskId = uuidv4();
    const newTask: OfflineTask = {
      id: taskId,
      type,
      data,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    setOfflineTasks(prev => [...prev, newTask]);
    return taskId;
  }, []);
  
  // Sync offline tasks when back online
  const syncOfflineTasks = useCallback(async () => {
    if (isOffline || isSyncing || offlineTasks.length === 0) {
      return;
    }
    
    setIsSyncing(true);
    
    try {
      // Get pending tasks
      const pendingTasks = offlineTasks.filter(task => task.status === 'pending');
      
      // Process each task
      for (const task of pendingTasks) {
        // Update task status to syncing
        setOfflineTasks(prev => 
          prev.map(t => 
            t.id === task.id ? { ...t, status: 'syncing' } : t
          )
        );
        
        try {
          // Call appropriate API based on task type
          let result;
          
          switch (task.type) {
            case 'process_image':
              // Handle image processing
              result = await syncImageProcessingTask(task);
              break;
              
            case 'process_audio':
              // Handle audio processing
              result = await syncAudioProcessingTask(task);
              break;
              
            case 'process_video':
              // Handle video processing
              result = await syncVideoProcessingTask(task);
              break;
              
            case 'voice_command':
              // Handle voice command
              result = await syncVoiceCommandTask(task);
              break;
              
            default:
              throw new Error(`Unknown task type: ${task.type}`);
          }
          
          // Update task as synced
          setOfflineTasks(prev => 
            prev.map(t => 
              t.id === task.id ? { 
                ...t, 
                status: 'synced',
                result
              } : t
            )
          );
          
        } catch (error) {
          console.error(`Error syncing task ${task.id}:`, error);
          
          // Update task as failed
          setOfflineTasks(prev => 
            prev.map(t => 
              t.id === task.id ? { 
                ...t, 
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error'
              } : t
            )
          );
        }
      }
    } finally {
      setIsSyncing(false);
    }
  }, [isOffline, isSyncing, offlineTasks]);
  
  // Helper functions for syncing different task types
  const syncImageProcessingTask = async (task: OfflineTask) => {
    const { data } = task;
    
    if (!data.fileData) {
      throw new Error('No file data found for image processing task');
    }
    
    const formData = new FormData();
    
    // Convert base64 to blob if needed
    if (typeof data.fileData === 'string' && data.fileData.startsWith('data:')) {
      const response = await fetch(data.fileData);
      const blob = await response.blob();
      formData.append('file', blob, data.filename || 'image.jpg');
    } else if (data.fileData instanceof Blob) {
      formData.append('file', data.fileData, data.filename || 'image.jpg');
    } else {
      throw new Error('Invalid file data format');
    }
    
    formData.append('options', JSON.stringify(data.options || {}));
    
    // Send request
    const response = await fetch('/api/vision/process-image', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to sync image processing: ${response.statusText}`);
    }
    
    return await response.json();
  };
  
  const syncAudioProcessingTask = async (task: OfflineTask) => {
    const { data } = task;
    
    if (!data.fileData) {
      throw new Error('No file data found for audio processing task');
    }
    
    const formData = new FormData();
    
    // Convert base64 to blob if needed
    if (typeof data.fileData === 'string' && data.fileData.startsWith('data:')) {
      const response = await fetch(data.fileData);
      const blob = await response.blob();
      formData.append('file', blob, data.filename || 'audio.wav');
    } else if (data.fileData instanceof Blob) {
      formData.append('file', data.fileData, data.filename || 'audio.wav');
    } else {
      throw new Error('Invalid file data format');
    }
    
    formData.append('options', JSON.stringify(data.options || {}));
    
    // Send request
    const response = await fetch('/api/asr/transcribe', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to sync audio processing: ${response.statusText}`);
    }
    
    return await response.json();
  };
  
  const syncVideoProcessingTask = async (task: OfflineTask) => {
    const { data } = task;
    
    if (!data.fileData) {
      throw new Error('No file data found for video processing task');
    }
    
    const formData = new FormData();
    
    // Convert base64 to blob if needed
    if (typeof data.fileData === 'string' && data.fileData.startsWith('data:')) {
      const response = await fetch(data.fileData);
      const blob = await response.blob();
      formData.append('file', blob, data.filename || 'video.mp4');
    } else if (data.fileData instanceof Blob) {
      formData.append('file', data.fileData, data.filename || 'video.mp4');
    } else {
      throw new Error('Invalid file data format');
    }
    
    formData.append('options', JSON.stringify(data.options || {}));
    
    // Send request
    const response = await fetch('/api/vision/process-video', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to sync video processing: ${response.statusText}`);
    }
    
    return await response.json();
  };
  
  const syncVoiceCommandTask = async (task: OfflineTask) => {
    const { data } = task;
    
    if (!data.audioData) {
      throw new Error('No audio data found for voice command task');
    }
    
    const formData = new FormData();
    
    // Convert base64 to blob if needed
    if (typeof data.audioData === 'string' && data.audioData.startsWith('data:')) {
      const response = await fetch(data.audioData);
      const blob = await response.blob();
      formData.append('audio', blob, 'command.wav');
    } else if (data.audioData instanceof Blob) {
      formData.append('audio', data.audioData, 'command.wav');
    } else {
      throw new Error('Invalid audio data format');
    }
    
    // Send request
    const response = await fetch('/api/voice/command', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to sync voice command: ${response.statusText}`);
    }
    
    return await response.json();
  };
  
  // Clear completed tasks
  const clearCompletedTasks = useCallback(() => {
    setOfflineTasks(prev => 
      prev.filter(task => task.status !== 'synced')
    );
  }, []);
  
  // Clear failed tasks
  const clearFailedTasks = useCallback(() => {
    setOfflineTasks(prev => 
      prev.filter(task => task.status !== 'failed')
    );
  }, []);
  
  // Retry failed tasks
  const retryFailedTasks = useCallback(() => {
    setOfflineTasks(prev => 
      prev.map(task => 
        task.status === 'failed' ? { ...task, status: 'pending' } : task
      )
    );
    
    if (!isOffline) {
      syncOfflineTasks();
    }
  }, [isOffline, syncOfflineTasks]);

  return {
    isOnline,
    pendingRequests,
    queueRequest,
    processQueue,
    clearQueue,
    executeRequest,
    get,
    post,
    put,
    delete: del,
    isOffline,
    isSyncing,
    offlineTasks,
    queueOfflineTask,
    syncOfflineTasks,
    clearCompletedTasks,
    clearFailedTasks,
    retryFailedTasks
  };
}; 