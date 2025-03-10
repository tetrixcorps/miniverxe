import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '../../services/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import LanguageSelector from '../LanguageSelector';
import { Button, Spinner, Box, Flex, Text, Avatar, IconButton } from '@chakra-ui/react';
import { MicrophoneIcon, StopIcon, VolumeUpIcon, VolumeMuteIcon } from '@chakra-ui/icons';
import { useOfflineHandler } from '../../hooks/useOfflineHandler';
import './ConversationPanel.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  language?: string;
}

const ConversationPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [sourceLanguage, setSourceLanguage] = useState<string>('eng');
  const [targetLanguage, setTargetLanguage] = useState<string>('eng');
  const [currentStreamingContent, setCurrentStreamingContent] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const api = useApi();
  const { isOffline, queueOfflineTask } = useOfflineHandler();
  const { speak, stop, speaking } = useSpeechSynthesis();
  
  // WebSocket for streaming responses
  const ws = useWebSocket('ws://your-api-url/api/conversation/ws');

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamingContent]);
  
  // Handle WebSocket messages
  useEffect(() => {
    if (!ws.isConnected) return;
    
    ws.addMessageListener((event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'token') {
        // Append token to current streaming content
        setCurrentStreamingContent(prev => prev + data.content);
      } else if (data.type === 'complete') {
        // Message is complete, add to messages list
        if (currentStreamingContent) {
          const newMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: currentStreamingContent,
            timestamp: new Date(),
            language: targetLanguage
          };
          setMessages(prev => [...prev, newMessage]);
          setCurrentStreamingContent('');
          
          // Speak response if not in English
          if (targetLanguage !== 'eng' && !speaking) {
            speak(currentStreamingContent);
          }
        }
        setIsProcessing(false);
      } else if (data.type === 'error') {
        console.error('WebSocket error:', data.content);
        setIsProcessing(false);
      }
    });
    
    return () => {
      ws.removeAllMessageListeners();
    };
  }, [ws, currentStreamingContent, targetLanguage, speak, speaking]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
      language: sourceLanguage
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);
    
    // Format conversation history
    const conversationHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    if (isOffline) {
      // Queue for offline processing
      queueOfflineTask({
        method: 'POST',
        url: '/api/conversation/chat',
        data: {
          text: inputText,
          conversation_history: conversationHistory,
          source_lang: sourceLanguage,
          target_lang: targetLanguage
        },
        onSuccess: (response) => {
          const assistantMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: response.response,
            timestamp: new Date(),
            language: targetLanguage
          };
          setMessages(prev => [...prev, assistantMessage]);
          setIsProcessing(false);
        },
        onError: (error) => {
          console.error('Error sending message:', error);
          setIsProcessing(false);
        }
      });
    } else if (isStreaming && ws.isConnected) {
      // Use WebSocket for streaming
      ws.sendMessage({
        text: inputText,
        conversation_history: conversationHistory,
        source_lang: sourceLanguage,
        target_lang: targetLanguage,
        stream: true
      });
    } else {
      // Use REST API
      try {
        const response = await api.post('/api/conversation/chat', {
          text: inputText,
          conversation_history: conversationHistory,
          source_lang: sourceLanguage,
          target_lang: targetLanguage
        });
        
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
          language: targetLanguage
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsProcessing(false);
        
        // Speak response if not in English
        if (targetLanguage !== 'eng' && !speaking) {
          speak(response.response);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        setIsProcessing(false);
      }
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current);
        await processAudioInput(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const processAudioInput = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('audio_file', audioBlob);
      formData.append('source_lang', sourceLanguage);
      formData.append('target_lang', targetLanguage);
      
      const response = await api.post('/api/conversation/audio', formData);
      
      // Add user message with transcription
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: response.transcription,
        timestamp: new Date(),
        language: sourceLanguage
      };
      
      // Add assistant message with response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        language: targetLanguage
      };
      
      setMessages(prev => [...prev, userMessage, assistantMessage]);
      
      // Speak response if not in English
      if (targetLanguage !== 'eng' && !speaking) {
        speak(response.response);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box className="conversation-panel">
      <Box className="conversation-header">
        <Text fontSize="xl" fontWeight="bold">Multilingual Conversation Assistant</Text>
        <Flex gap={4}>
          <LanguageSelector 
            value={sourceLanguage} 
            onChange={(value) => setSourceLanguage(value)} 
            label="I speak"
          />
          <LanguageSelector 
            value={targetLanguage} 
            onChange={(value) => setTargetLanguage(value)}
            label="Assistant speaks"
          />
          <Button
            size="sm"
            onClick={() => setIsStreaming(!isStreaming)}
            colorScheme={isStreaming ? "green" : "gray"}
          >
            {isStreaming ? "Streaming On" : "Streaming Off"}
          </Button>
        </Flex>
      </Box>
      
      <Box className="conversation-messages">
        {messages.map((msg) => (
          <Flex 
            key={msg.id} 
            className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <Avatar 
              size="sm" 
              name={msg.role === 'user' ? 'User' : 'Assistant'} 
              src={msg.role === 'assistant' ? '/assets/assistant-avatar.png' : undefined}
            />
            <Box>
              <Text fontWeight="bold">
                {msg.role === 'user' ? 'You' : 'Assistant'}
                {msg.language && ` (${msg.language})`}
              </Text>
              <Text>{msg.content}</Text>
              <Text fontSize="xs" color="gray.500">
                {msg.timestamp.toLocaleTimeString()}
              </Text>
            </Box>
            {msg.role === 'assistant' && (
              <IconButton
                icon={speaking ? <VolumeMuteIcon /> : <VolumeUpIcon />}
                aria-label="Speak"
                size="sm"
                onClick={() => {
                  if (speaking) {
                    stop();
                  } else {
                    speak(msg.content);
                  }
                }}
              />
            )}
          </Flex>
        ))}
        
        {currentStreamingContent && (
          <Flex className="message assistant-message streaming">
            <Avatar 
              size="sm" 
              name="Assistant" 
              src="/assets/assistant-avatar.png"
            />
            <Box>
              <Text fontWeight="bold">
                Assistant {targetLanguage && `(${targetLanguage})`}
              </Text>
              <Text>{currentStreamingContent}</Text>
            </Box>
          </Flex>
        )}
        
        <div ref={messagesEndRef} />
      </Box>
      
      <Box className="conversation-input">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message..."
          disabled={isProcessing || isRecording}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        
        <Flex gap={2}>
          <Button
            onClick={handleSendMessage}
            isDisabled={!inputText.trim() || isProcessing || isRecording}
            colorScheme="blue"
            leftIcon={isProcessing ? <Spinner size="sm" /> : undefined}
          >
            Send
          </Button>
          
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            colorScheme={isRecording ? "red" : "blue"}
            leftIcon={isRecording ? <StopIcon /> : <MicrophoneIcon />}
            isDisabled={isProcessing}
          >
            {isRecording ? 'Stop' : 'Record'}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default ConversationPanel; 