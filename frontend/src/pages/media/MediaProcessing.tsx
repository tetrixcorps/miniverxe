import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Button, Box, 
         CircularProgress, Grid, Divider, Chip, Alert, LinearProgress } from '@mui/material';
import { CheckCircle, Error, Videocam, AudioFile, Category, 
         Translate, HighQuality } from '@mui/icons-material';
import { ApiClient } from '../../api/client';

const apiClient = new ApiClient();

interface MediaTaskStatus {
  task_id: string;
  status: 'created' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  media_details?: {
    transcription_complete: boolean;
    enhancement_complete: boolean;
    categorization_complete: boolean;
    detected_language?: string;
    duration?: number;
    resolution?: string;
    categories?: Array<{ label: string; confidence: number }>;
    enhanced_url?: string;
    transcript_url?: string;
  };
}

// Component to display progress with label
function LinearProgressWithLabel(props: { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

const MediaProcessing: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<MediaTaskStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Polling interval in milliseconds (2 seconds)
  const POLLING_INTERVAL = 2000;
  
  useEffect(() => {
    let isMounted = true;
    let pollingTimer: NodeJS.Timeout;
    
    const fetchStatus = async () => {
      if (!taskId) return;
      
      try {
        const response = await apiClient.get<MediaTaskStatus>(`/api/background/media/tasks/${taskId}/status`);
        
        if (isMounted) {
          setStatus(response);
          setLoading(false);
          
          // Continue polling if still processing
          if (response.status === 'processing' || response.status === 'created') {
            pollingTimer = setTimeout(fetchStatus, POLLING_INTERVAL);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch task status');
          setLoading(false);
        }
      }
    };
    
    fetchStatus();
    
    return () => {
      isMounted = false;
      clearTimeout(pollingTimer);
    };
  }, [taskId]);
  
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'Unknown';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const renderStatusIcon = (taskStatus: 'created' | 'processing' | 'completed' | 'failed') => {
    switch (taskStatus) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'failed':
        return <Error color="error" />;
      case 'processing':
      case 'created':
      default:
        return <CircularProgress size={24} />;
    }
  };
  
  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      );
    }
    
    if (!status) {
      return (
        <Alert severity="warning" sx={{ my: 2 }}>
          No task information found.
        </Alert>
      );
    }
    
    return (
      <>
        <Box sx={{ mb: 4 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              {renderStatusIcon(status.status)}
            </Grid>
            <Grid item xs>
              <Typography variant="h6">
                Status: {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
              </Typography>
              {status.status === 'processing' && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <LinearProgressWithLabel value={status.progress} />
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          Processing Details
        </Typography>
        
        <Grid container spacing={2}>
          {status.media_details && (
            <>
              {/* Media info section */}
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Media Information
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Duration:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        {status.media_details.duration ? 
                          formatDuration(status.media_details.duration) : 'Processing...'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Resolution:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        {status.media_details.resolution || 'Processing...'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Detected Language:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        {status.media_details.detected_language || 'Processing...'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              {/* Tasks status */}
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Processing Tasks
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ mr: 1 }}>
                        {status.media_details.transcription_complete ? 
                          <CheckCircle color="success" fontSize="small" /> : 
                          <CircularProgress size={16} />}
                      </Box>
                      <Typography variant="body2">
                        Transcription
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ mr: 1 }}>
                        {status.media_details.enhancement_complete ? 
                          <CheckCircle color="success" fontSize="small" /> : 
                          <CircularProgress size={16} />}
                      </Box>
                      <Typography variant="body2">
                        Media Enhancement
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ mr: 1 }}>
                        {status.media_details.categorization_complete ? 
                          <CheckCircle color="success" fontSize="small" /> : 
                          <CircularProgress size={16} />}
                      </Box>
                      <Typography variant="body2">
                        Content Categorization
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              
              {/* Categories */}
              {status.status === 'completed' && status.media_details.categories && 
               status.media_details.categories.length > 0 && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Content Categories
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {status.media_details.categories.map((category, index) => (
                        <Chip 
                          key={index}
                          label={`${category.label} (${(category.confidence * 100).toFixed(0)}%)`}
                          icon={<Category fontSize="small" />}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              )}
              
              {/* Download/view section for completed tasks */}
              {status.status === 'completed' && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Results
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {status.media_details.enhanced_url && (
                        <Button 
                          variant="outlined"
                          startIcon={<HighQuality />}
                          href={status.media_details.enhanced_url}
                          target="_blank"
                        >
                          Download Enhanced Media
                        </Button>
                      )}
                      
                      {status.media_details.transcript_url && (
                        <Button 
                          variant="outlined"
                          startIcon={<Translate />}
                          onClick={() => navigate(`/media/transcript/${taskId}`)}
                        >
                          View Transcript
                        </Button>
                      )}
                      
                      <Button 
                        variant="contained"
                        onClick={() => navigate('/media')}
                      >
                        Back to Media Library
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              )}
            </>
          )}
        </Grid>
        
        {/* Error message */}
        {status.status === 'failed' && status.error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {status.error}
          </Alert>
        )}
      </>
    );
  };
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4, marginBottom: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Media Processing
        </Typography>
        
        {renderContent()}
        
        {/* Buttons for non-completed statuses */}
        {status && status.status !== 'completed' && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/media')}
            >
              Back to Media Library
            </Button>
            
            {status.status === 'failed' && (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate('/media/upload')}
              >
                Try Again with New File
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default MediaProcessing; 