import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Button, VStack, HStack, Text, Heading, Avatar, Badge, 
  IconButton, Flex, Spinner, useToast
} from '@chakra-ui/react';
import { 
  PhoneIcon, CheckIcon, CloseIcon, MicrophoneIcon, 
  MicrophoneOffIcon, AnalysisIcon
} from '@chakra-ui/icons';
import { useAuth } from '../hooks/useAuth';
import { useOfflineHandler } from '../hooks/useOfflineHandler';

interface VoipCallerProps {
  userId?: string;
  userName?: string;
  onCallComplete?: (callData: any) => void;
}

export const VoipCaller: React.FC<VoipCallerProps> = ({ 
  userId, 
  userName,
  onCallComplete 
}) => {
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [transcription, setTranscription] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [callAnalysis, setCallAnalysis] = useState<any>(null);
  const [callId, setCallId] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  const toast = useToast();
  const { isOffline } = useOfflineHandler();
  const { getAccessToken, user } = useAuth();
  
  useEffect(() => {
    return () => {
      // Cleanup WebSocket and media streams when component unmounts
      endCall();
    };
  }, []);
  
  const startCall = async () => {
    if (isOffline) {
      toast({
        title: "Offline Mode",
        description: "VOIP calls require an internet connection.",
        status: "warning",
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    try {
      setIsConnecting(true);
      
      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // 2. Create call via API
      const token = await getAccessToken();
      const response = await fetch('/api/voip/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          callee_id: userId,
          options: { 
            transcription_enabled: true,
            recording_enabled: false
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create call: ${response.statusText}`);
      }
      
      const callData = await response.json();
      setCallId(callData.call_id);
      
      // 3. Connect WebSocket
      connectWebSocket(callData.call_id);
      
      // 4. Start audio processing
      setupAudioProcessing();
      
      setIsCalling(true);
      
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Call Failed",
        description: error instanceof Error ? error.message : "Could not start call",
        status: "error",
        duration: 5000,
        isClosable: true
      });
      setIsConnecting(false);
    }
  };
  
  const connectWebSocket = async (callId: string) => {
    try {
      const token = await getAccessToken();
      const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/voip/ws/${callId}`);
      
      ws.onopen = () => {
        // Send authentication
        ws.send(JSON.stringify({ token }));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'connection' && data.status === 'connected') {
          setIsConnecting(false);
          setIsCalling(true);
        }
        
        if (data.type === 'event') {
          handleCallEvent(data.event_type, data.data);
        }
        
        if (data.type === 'transcription') {
          handleTranscription(data.data);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "WebSocket connection failed",
          status: "error",
          duration: 3000,
          isClosable: true
        });
        endCall();
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        if (isCallActive) {
          toast({
            title: "Call Ended",
            description: "The connection was closed",
            status: "info",
            duration: 3000,
            isClosable: true
          });
          setIsCallActive(false);
          setIsCalling(false);
        }
      };
      
      wsRef.current = ws;
      
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      toast({
        title: "Connection Error",
        description: "Could not establish call connection",
        status: "error",
        duration: 5000,
        isClosable: true
      });
      endCall();
    }
  };
  
  const setupAudioProcessing = () => {
    if (!streamRef.current) return;
    
    // Create audio context and processor
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    const source = audioContext.createMediaStreamSource(streamRef.current);
    
    source.connect(processor);
    processor.connect(audioContext.destination);
    
    processor.onaudioprocess = (e) => {
      if (isCallActive && !isMuted && wsRef.current?.readyState === WebSocket.OPEN) {
        // Convert audio data to format expected by backend
        const inputData = e.inputBuffer.getChannelData(0);
        
        // For simplicity, just send raw PCM data
        // In production, would compress using opus or similar
        const dataArray = new Float32Array(inputData);
        
        // Send audio type first
        wsRef.current.send(JSON.stringify({
          type: "audio"
        }));
        
        // Then send binary data
        wsRef.current.send(dataArray.buffer);
      }
    };
    
    audioContextRef.current = audioContext;
    processorRef.current = processor;
  };
  
  const handleCallEvent = (eventType: string, data: any) => {
    if (eventType === 'status_change') {
      if (data.status === 'active') {
        setIsCallActive(true);
        setIsCalling(false);
      } else if (data.status === 'ended') {
        endCall();
      }
    }
    
    // Handle other events
    console.log('Call event:', eventType, data);
  };
  
  const handleTranscription = (result: any) => {
    if (result.is_final) {
      setTranscription(prev => 
        `${prev}[${result.speaker}]: ${result.text}\n`
      );
    }
  };
  
  const acceptCall = () => {
    if (!wsRef.current || !callId) return;
    
    // Send acceptance event
    wsRef.current.send(JSON.stringify({
      type: "event",
      event_type: "status_change",
      data: { status: "active" }
    }));
    
    setIsCallActive(true);
    setIsCalling(false);
  };
  
  const rejectCall = () => {
    endCall();
  };
  
  const endCall = async () => {
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Clean up audio processing
    if (processorRef.current && audioContextRef.current) {
      processorRef.current.disconnect();
      audioContextRef.current.close();
      processorRef.current = null;
      audioContextRef.current = null;
    }
    
    // Call API to end call if we have a call ID
    if (callId) {
      try {
        const token = await getAccessToken();
        await fetch(`/api/voip/calls/${callId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Error ending call via API:', error);
      }
    }
    
    // Reset state
    setIsCallActive(false);
    setIsCalling(false);
    setIsConnecting(false);
    setCallId(null);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    // Mute/unmute audio tracks
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted; // Toggle from current state
      });
    }
  };
  
  const analyzeCall = async () => {
    if (!callId) return;
    
    try {
      setIsAnalyzing(true);
      
      const token = await getAccessToken();
      const response = await fetch(`/api/voip/calls/${callId}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to analyze call: ${response.statusText}`);
      }
      
      const analysis = await response.json();
      setCallAnalysis(analysis);
      
      toast({
        title: "Call Analysis Complete",
        description: "Call analysis has been completed",
        status: "success",
        duration: 3000,
        isClosable: true
      });
      
    } catch (error) {
      console.error('Error analyzing call:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Could not analyze call",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const renderCallStatus = () => {
    if (isConnecting) {
      return (
        <Box textAlign="center" p={6}>
          <Spinner size="xl" mb={4} />
          <Text>Establishing connection...</Text>
        </Box>
      );
    }
    
    if (isCalling) {
      return (
        <Box textAlign="center" p={6}>
          <Avatar size="xl" name={userName || userId} mb={4} />
          <Heading size="md" mb={2}>{userName || userId}</Heading>
          <Text mb={4}>Calling...</Text>
          
          <HStack spacing={4} justifyContent="center">
            <IconButton
              aria-label="Accept Call"
              icon={<CheckIcon />}
              colorScheme="green"
              rounded="full"
              onClick={acceptCall}
            />
            <IconButton
              aria-label="Reject Call"
              icon={<CloseIcon />}
              colorScheme="red"
              rounded="full"
              onClick={rejectCall}
            />
          </HStack>
        </Box>
      );
    }
    
    if (isCallActive) {
      return (
        <Box>
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Heading size="md">{userName || userId}</Heading>
              <Badge colorScheme="green">Connected</Badge>
            </Box>
            <HStack>
              <IconButton
                aria-label={isMuted ? "Unmute" : "Mute"}
                icon={isMuted ? <MicrophoneOffIcon /> : <MicrophoneIcon />}
                onClick={toggleMute}
                size="sm"
              />
              <IconButton
                aria-label="End Call"
                icon={<CloseIcon />}
                colorScheme="red"
                onClick={endCall}
                size="sm"
              />
              <IconButton
                aria-label="Analyze Call"
                icon={<AnalysisIcon />}
                colorScheme="blue"
                onClick={analyzeCall}
                isLoading={isAnalyzing}
                size="sm"
              />
            </HStack>
          </Flex>
          
          <Box bg="gray.50" p={4} borderRadius="md" height="300px" overflowY="auto" mb={4}>
            <Text whiteSpace="pre-wrap" fontSize="sm">
              {transcription || "Transcription will appear here..."}
            </Text>
          </Box>
          
          {callAnalysis && (
            <Box bg="blue.50" p={4} borderRadius="md" mb={4}>
              <Heading size="sm" mb={2}>Call Analysis</Heading>
              <Text mb={1}><strong>Sentiment:</strong> {callAnalysis.sentiment.overall}</Text>
              <Text mb={1}><strong>Topics:</strong> {callAnalysis.topics.join(", ")}</Text>
              <Text mb={1}><strong>Action Items:</strong></Text>
              <Box as="ul" pl={5}>
                {callAnalysis.action_items.map((item: string, i: number) => (
                  <Box as="li" key={i}>{item}</Box>
                ))}
              </Box>
              <Text mb={1}><strong>Summary:</strong> {callAnalysis.summary}</Text>
            </Box>
          )}
        </Box>
      );
    }
    
    // Default - ready to call
    return (
      <Button
        leftIcon={<PhoneIcon />}
        colorScheme="green"
        onClick={startCall}
        isDisabled={isOffline}
        size="lg"
      >
        Call {userName || userId}
      </Button>
    );
  };
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      shadow="md"
      bg="white"
    >
      {renderCallStatus()}
    </Box>
  );
}; 