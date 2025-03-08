import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Button, Box, Grid, 
         Slider, FormControlLabel, Switch, CircularProgress,
         Alert, Divider, Card, CardMedia, Tabs, Tab } from '@mui/material';
import { HighQuality, VolumeUp, Equalizer, 
         Compare, Save, Undo } from '@mui/icons-material';
import { ApiClient } from '../../api/client';

const apiClient = new ApiClient();

interface MediaDetails {
  id: string;
  name: string;
  type: 'video' | 'audio';
  duration: number;
  original_url: string;
  thumbnail_url?: string;
  resolution?: string;
  audio_channels?: number;
  file_size: number;
}

interface EnhancementSettings {
  video: {
    resolution: number;  // scale factor: 1x, 2x, 4x
    denoising: number;   // 0-100
    sharpness: number;   // 0-100
    colorEnhancement: boolean;
    stabilization: boolean;
  };
  audio: {
    denoising: number;   // 0-100
    normalization: boolean;
    clarity: number;     // 0-100
    backgroundRemoval: boolean;
  };
}

const MediaEnhancement: React.FC = () => {
  const { mediaId } = useParams<{ mediaId: string }>();
  const navigate = useNavigate();
  
  // State for media details
  const [mediaDetails, setMediaDetails] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for enhancement settings
  const [settings, setSettings] = useState<EnhancementSettings>({
    video: {
      resolution: 2,
      denoising: 50,
      sharpness: 70,
      colorEnhancement: true,
      stabilization: false
    },
    audio: {
      denoising: 70,
      normalization: true,
      clarity: 60,
      backgroundRemoval: false
    }
  });
  
  // State for preview/processing
  const [tabValue, setTabValue] = useState(0); // 0 = settings, 1 = preview
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [enhancementProgress, setEnhancementProgress] = useState(0);
  
  // Fetch media details
  useEffect(() => {
    const fetchMediaDetails = async () => {
      if (!mediaId) return;
      
      setLoading(true);
      try {
        // In a real implementation, we would call the API
        // For now, let's simulate the API response
        setTimeout(() => {
          const mockMediaDetails: MediaDetails = {
            id: mediaId,
            name: 'Product Demo Video',
            type: 'video',
            duration: 184, // seconds
            original_url: 'https://example.com/videos/original.mp4',
            thumbnail_url: 'https://via.placeholder.com/640x360?text=Product+Demo',
            resolution: '1280x720',
            audio_channels: 2,
            file_size: 45678912 // bytes
          };
          
          setMediaDetails(mockMediaDetails);
          setLoading(false);
        }, 1000);
        
      } catch (err: any) {
        setError(err.message || 'Failed to fetch media details');
        setLoading(false);
      }
    };
    
    fetchMediaDetails();
  }, [mediaId]);
  
  const handleSettingChange = (
    type: 'video' | 'audio',
    setting: string,
    value: number | boolean
  ) => {
    setSettings({
      ...settings,
      [type]: {
        ...settings[type],
        [setting]: value
      }
    });
  };
  
  const generatePreview = async () => {
    setIsProcessing(true);
    setEnhancementProgress(0);
    
    try {
      // Simulate preview generation
      const progressInterval = setInterval(() => {
        setEnhancementProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);
      
      // Simulate preview completion after 5 seconds
      setTimeout(() => {
        clearInterval(progressInterval);
        setEnhancementProgress(100);
        setPreviewUrl('https://via.placeholder.com/640x360?text=Enhanced+Preview');
        setTabValue(1); // Switch to preview tab
        setIsProcessing(false);
      }, 5000);
      
      // In a real implementation, this would be:
      // const response = await apiClient.post('/api/media/preview-enhancement', {
      //   media_id: mediaId,
      //   settings: settings
      // });
      // setPreviewUrl(response.preview_url);
      
    } catch (err: any) {
      setError('Failed to generate preview: ' + err.message);
      setIsProcessing(false);
    }
  };
  
  const startEnhancement = async () => {
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would be:
      // const response = await apiClient.post('/api/background/media/enhance', {
      //   media_id: mediaId,
      //   settings: settings
      // });
      // navigate(`/media/process/${response.task_id}`);
      
      // Simulate API call delay
      setTimeout(() => {
        navigate(`/media/process/sample-task-id`);
      }, 1500);
      
    } catch (err: any) {
      setError('Failed to start enhancement: ' + err.message);
      setIsProcessing(false);
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
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
    
    if (!mediaDetails) {
      return (
        <Alert severity="warning" sx={{ my: 2 }}>
          No media details found.
        </Alert>
      );
    }
    
    return (
      <>
        <Grid container spacing={4}>
          {/* Media preview */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Original Media
            </Typography>
            
            {mediaDetails.type === 'video' ? (
              <Card>
                <CardMedia
                  component="img"
                  image={mediaDetails.thumbnail_url || 'https://via.placeholder.com/640x360?text=No+Preview'}
                  alt={mediaDetails.name}
                  sx={{ width: '100%' }}
                />
              </Card>
            ) : (
              <Card sx={{ 
                height: 200, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'secondary.dark' 
              }}>
                <VolumeUp sx={{ fontSize: 64, color: 'white' }} />
              </Card>
            )}
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">
                {mediaDetails.name}
              </Typography>
              <Grid container spacing={1} sx={{ mt: 1 }}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Resolution:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">
                    {mediaDetails.resolution || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    File Size:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">
                    {formatFileSize(mediaDetails.file_size)}
                  </Typography>
                </Grid>
                
                {mediaDetails.audio_channels && (
                  <>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Audio:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {mediaDetails.audio_channels} channels
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          </Grid>
          
          {/* Enhancement controls or preview */}
          <Grid item xs={12} md={6}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs 
                value={tabValue}
                onChange={(_, newValue) => setTabValue(newValue)}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Enhancement Settings" />
                <Tab label="Preview" disabled={!previewUrl && !isProcessing} />
              </Tabs>
            </Box>
            
            {tabValue === 0 ? (
              // Settings tab
              <>
                {mediaDetails.type === 'video' && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Video Enhancement
                    </Typography>
                    
                    <Typography gutterBottom>Resolution Upscaling</Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs>
                        <Slider
                          value={settings.video.resolution}
                          step={1}
                          marks={[
                            { value: 1, label: '1x' },
                            { value: 2, label: '2x' },
                            { value: 4, label: '4x' }
                          ]}
                          min={1}
                          max={4}
                          valueLabelDisplay="auto"
                          onChange={(_, value) => 
                            handleSettingChange('video', 'resolution', value as number)
                          }
                          disabled={isProcessing}
                        />
                      </Grid>
                    </Grid>
                    
                    <Typography gutterBottom>Denoising</Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs>
                        <Slider
                          value={settings.video.denoising}
                          min={0}
                          max={100}
                          valueLabelDisplay="auto"
                          onChange={(_, value) => 
                            handleSettingChange('video', 'denoising', value as number)
                          }
                          disabled={isProcessing}
                        />
                      </Grid>
                    </Grid>
                    
                    <Typography gutterBottom>Sharpness</Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs>
                        <Slider
                          value={settings.video.sharpness}
                          min={0}
                          max={100}
                          valueLabelDisplay="auto"
                          onChange={(_, value) => 
                            handleSettingChange('video', 'sharpness', value as number)
                          }
                          disabled={isProcessing}
                        />
                      </Grid>
                    </Grid>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.video.colorEnhancement}
                          onChange={(_, checked) => 
                            handleSettingChange('video', 'colorEnhancement', checked)
                          }
                          disabled={isProcessing}
                        />
                      }
                      label="Color Enhancement"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.video.stabilization}
                          onChange={(_, checked) => 
                            handleSettingChange('video', 'stabilization', checked)
                          }
                          disabled={isProcessing}
                        />
                      }
                      label="Video Stabilization"
                    />
                  </Box>
                )}
                
                {/* Audio settings - shown for both video and audio */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Audio Enhancement
                  </Typography>
                  
                  <Typography gutterBottom>Noise Reduction</Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs>
                      <Slider
                        value={settings.audio.denoising}
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                        onChange={(_, value) => 
                          handleSettingChange('audio', 'denoising', value as number)
                        }
                        disabled={isProcessing}
                      />
                    </Grid>
                  </Grid>
                  
                  <Typography gutterBottom>Clarity Enhancement</Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs>
                      <Slider
                        value={settings.audio.clarity}
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                        onChange={(_, value) => 
                          handleSettingChange('audio', 'clarity', value as number)
                        }
                        disabled={isProcessing}
                      />
                    </Grid>
                  </Grid>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.audio.normalization}
                        onChange={(_, checked) => 
                          handleSettingChange('audio', 'normalization', checked)
                        }
                        disabled={isProcessing}
                      />
                    }
                    label="Volume Normalization"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.audio.backgroundRemoval}
                        onChange={(_, checked) => 
                          handleSettingChange('audio', 'backgroundRemoval', checked)
                        }
                        disabled={isProcessing}
                      />
                    }
                    label="Background Noise Removal"
                  />
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/media')}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<Compare />}
                      onClick={generatePreview}
                      disabled={isProcessing}
                      sx={{ mr: 1 }}
                    >
                      Generate Preview
                    </Button>
                    
                    <Button
                      variant="contained"
                      startIcon={<HighQuality />}
                      onClick={startEnhancement}
                      disabled={isProcessing}
                      color="primary"
                    >
                      Enhance Media
                    </Button>
                  </Box>
                </Box>
              </>
            ) : (
              // Preview tab
              <Box>
                {isProcessing ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress size={48} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                      Generating Preview
                    </Typography>
                    <Box sx={{ width: '100%', mt: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={enhancementProgress} 
                      />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {enhancementProgress}% Complete
                      </Typography>
                    </Box>
                  </Box>
                ) : previewUrl ? (
                  <>
                    <Typography variant="subtitle1" gutterBottom>
                      Enhanced Preview
                    </Typography>
                    <Card>
                      <CardMedia
                        component="img"
                        image={previewUrl}
                        alt="Enhanced Preview"
                        sx={{ width: '100%' }}
                      />
                    </Card>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Undo />}
                        onClick={() => setTabValue(0)}
                      >
                        Back to Settings
                      </Button>
                      
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={startEnhancement}
                        color="primary"
                      >
                        Process Full Media
                      </Button>
                    </Box>
                  </>
                ) : (
                  <Alert severity="info">
                    Generate a preview to see the enhanced media.
                  </Alert>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </>
    );
  };
  
  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4, marginBottom: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Media Enhancement
        </Typography>
        
        {renderContent()}
      </Paper>
    </Container>
  );
};

export default MediaEnhancement; 