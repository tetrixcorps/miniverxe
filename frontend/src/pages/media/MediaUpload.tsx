import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Button, FormControlLabel, 
         Checkbox, MenuItem, Select, FormControl, InputLabel,
         Grid, Box, CircularProgress, Alert } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { ApiClient } from '../../api/client';
import { useOfflineHandler } from '../../hooks/useOfflineHandler';

const apiClient = new ApiClient();

const MediaUpload: React.FC = () => {
  const navigate = useNavigate();
  const { isOffline } = useOfflineHandler(apiClient);
  
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>('en-US');
  const [tasks, setTasks] = useState({
    transcribe: true,
    enhance: false,
    categorize: true
  });
  const [enhanceOptions, setEnhanceOptions] = useState({
    resolution: false,
    denoise: false
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
      'audio/*': ['.mp3', '.wav', '.m4a', '.flac']
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024, // 500MB limit
  });
  
  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      
      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Add selected tasks
      const selectedTasks: string[] = [];
      if (tasks.transcribe) selectedTasks.push('transcribe');
      if (tasks.enhance) selectedTasks.push('enhance');
      if (tasks.categorize) selectedTasks.push('categorize');
      
      formData.append('tasks', selectedTasks.join(','));
      formData.append('language', language);
      formData.append('enhance_resolution', enhanceOptions.resolution.toString());
      formData.append('denoise_audio', enhanceOptions.denoise.toString());
      
      // Upload file and start processing
      const response = await apiClient.post('/api/media/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Navigate to processing status page
      navigate(`/media/process/${response.task_id}`);
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  // Handle task selection changes
  const handleTaskChange = (task: keyof typeof tasks) => {
    setTasks({
      ...tasks,
      [task]: !tasks[task]
    });
  };
  
  // Handle enhancement option changes
  const handleEnhanceOptionChange = (option: keyof typeof enhanceOptions) => {
    setEnhanceOptions({
      ...enhanceOptions,
      [option]: !enhanceOptions[option]
    });
  };
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Upload Media for Processing
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {isOffline && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            You are currently offline. Your upload will be queued for processing
            when you reconnect.
          </Alert>
        )}
        
        <Box 
          {...getRootProps()} 
          sx={{
            border: '2px dashed #cccccc',
            borderRadius: 2,
            padding: 4,
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: 3,
            backgroundColor: isDragActive ? '#f0f9ff' : '#fafafa',
            '&:hover': {
              backgroundColor: '#f0f9ff'
            }
          }}
        >
          <input {...getInputProps()} />
          
          {file ? (
            <Box>
              <Typography variant="body1" gutterBottom>
                Selected file: {file.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="body1">
                {isDragActive 
                  ? 'Drop the media file here' 
                  : 'Drag and drop a media file here, or click to select'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Supports video (MP4, MOV, AVI, MKV) and audio (MP3, WAV, M4A, FLAC)
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Maximum file size: 500MB
              </Typography>
            </Box>
          )}
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Processing Tasks
            </Typography>
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={tasks.transcribe} 
                  onChange={() => handleTaskChange('transcribe')}
                />
              }
              label="Transcribe audio/video"
            />
            <br />
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={tasks.enhance} 
                  onChange={() => handleTaskChange('enhance')}
                />
              }
              label="Enhance media quality"
            />
            <br />
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={tasks.categorize} 
                  onChange={() => handleTaskChange('categorize')}
                />
              }
              label="Categorize content"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Options
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="language-label">Language</InputLabel>
              <Select
                labelId="language-label"
                value={language}
                label="Language"
                onChange={(e) => setLanguage(e.target.value as string)}
              >
                <MenuItem value="en-US">English (US)</MenuItem>
                <MenuItem value="es-ES">Spanish</MenuItem>
                <MenuItem value="fr-FR">French</MenuItem>
                <MenuItem value="de-DE">German</MenuItem>
                <MenuItem value="ja-JP">Japanese</MenuItem>
                <MenuItem value="zh-CN">Chinese (Simplified)</MenuItem>
              </Select>
            </FormControl>
            
            {tasks.enhance && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Enhancement Options
                </Typography>
                
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={enhanceOptions.resolution} 
                      onChange={() => handleEnhanceOptionChange('resolution')}
                    />
                  }
                  label="Enhance video resolution"
                />
                <br />
                
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={enhanceOptions.denoise} 
                      onChange={() => handleEnhanceOptionChange('denoise')}
                    />
                  }
                  label="Denoise audio"
                />
              </Box>
            )}
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/media')}
            disabled={uploading}
          >
            Cancel
          </Button>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            disabled={!file || uploading}
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {uploading ? 'Processing...' : 'Process Media'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default MediaUpload; 