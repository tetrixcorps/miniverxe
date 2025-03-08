import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box, Grid, Card, 
         CardContent, CardActions, CardMedia, Chip, CircularProgress,
         FormControl, InputLabel, Select, MenuItem, InputAdornment,
         TextField, Pagination, IconButton, Paper, Tabs, Tab } from '@mui/material';
import { Add, Search, VideoLibrary, AudioTrack, Videocam, 
         Audiotrack, Category } from '@mui/icons-material';
import { ApiClient } from '../../api/client';

const apiClient = new ApiClient();

interface MediaItem {
  id: string;
  name: string;
  type: 'video' | 'audio';
  duration: number;
  created_at: string;
  thumbnail_url?: string;
  categories: Array<{ label: string; confidence: number }>;
  enhanced: boolean;
  transcribed: boolean;
}

interface MediaLibraryResponse {
  items: MediaItem[];
  total: number;
  page: number;
  page_size: number;
}

const MediaLibrary: React.FC = () => {
  const navigate = useNavigate();
  
  // State for media items
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // State for filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaType, setMediaType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date_desc');
  
  // State for tab (My Media, Processing, All)
  const [tabValue, setTabValue] = useState(0);
  
  // Fetch media items
  useEffect(() => {
    const fetchMediaItems = async () => {
      setLoading(true);
      try {
        // In a real implementation, we would fetch from the API with parameters
        // For now, let's simulate the API response
        
        // This is a placeholder; in a real implementation, you would call:
        // const response = await apiClient.get<MediaLibraryResponse>(
        //   '/api/media',
        //   {
        //     page,
        //     page_size: 12,
        //     type: mediaType !== 'all' ? mediaType : undefined,
        //     search: searchQuery || undefined,
        //     sort: sortBy,
        //     status: tabValue === 1 ? 'processing' : undefined
        //   }
        // );
        
        // Simulate an API response
        setTimeout(() => {
          const mockItems: MediaItem[] = [
            {
              id: '1',
              name: 'Product Demo Video',
              type: 'video',
              duration: 184, // seconds
              created_at: '2023-05-15T14:30:00Z',
              thumbnail_url: 'https://via.placeholder.com/320x180?text=Product+Demo',
              categories: [
                { label: 'Technology', confidence: 0.95 },
                { label: 'Business', confidence: 0.85 }
              ],
              enhanced: true,
              transcribed: true
            },
            {
              id: '2',
              name: 'Customer Interview',
              type: 'audio',
              duration: 641, // seconds
              created_at: '2023-05-10T09:15:00Z',
              categories: [
                { label: 'Interview', confidence: 0.92 },
                { label: 'Testimonial', confidence: 0.88 }
              ],
              enhanced: false,
              transcribed: true
            },
            {
              id: '3',
              name: 'Training Webinar',
              type: 'video',
              duration: 1832, // seconds
              created_at: '2023-05-05T16:45:00Z',
              thumbnail_url: 'https://via.placeholder.com/320x180?text=Training+Webinar',
              categories: [
                { label: 'Education', confidence: 0.96 },
                { label: 'Technology', confidence: 0.84 }
              ],
              enhanced: true,
              transcribed: true
            },
            {
              id: '4',
              name: 'Sales Call Recording',
              type: 'audio',
              duration: 312, // seconds
              created_at: '2023-05-02T11:20:00Z',
              categories: [
                { label: 'Sales', confidence: 0.91 },
                { label: 'Business', confidence: 0.87 }
              ],
              enhanced: true,
              transcribed: false
            }
          ];
          
          setMediaItems(mockItems);
          setTotalPages(3); // Mock value
          setLoading(false);
        }, 1000);
        
      } catch (err: any) {
        setError(err.message || 'Failed to fetch media items');
        setLoading(false);
      }
    };
    
    fetchMediaItems();
  }, [page, mediaType, searchQuery, sortBy, tabValue]);
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0);
  };
  
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    // The useEffect will trigger a new fetch
  };
  
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
        <Box my={4} textAlign="center">
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      );
    }
    
    if (mediaItems.length === 0) {
      return (
        <Box my={8} textAlign="center">
          <VideoLibrary sx={{ fontSize: 64, color: 'text.secondary' }} />
          <Typography variant="h6" color="text.secondary" mt={2}>
            No media found
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => navigate('/media/upload')}
            sx={{ mt: 2 }}
          >
            Upload Media
          </Button>
        </Box>
      );
    }
    
    return (
      <>
        <Grid container spacing={3}>
          {mediaItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {item.type === 'video' && item.thumbnail_url ? (
                  <CardMedia
                    component="img"
                    height="140"
                    image={item.thumbnail_url}
                    alt={item.name}
                  />
                ) : (
                  <Box 
                    sx={{ 
                      height: 140, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: item.type === 'video' ? 'primary.dark' : 'secondary.dark'
                    }}
                  >
                    {item.type === 'video' ? 
                      <Videocam sx={{ fontSize: 48, color: 'white' }} /> : 
                      <Audiotrack sx={{ fontSize: 48, color: 'white' }} />}
                  </Box>
                )}
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" noWrap>
                    {item.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {formatDuration(item.duration)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(item.created_at)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {item.categories.slice(0, 2).map((category, idx) => (
                      <Chip
                        key={idx}
                        label={category.label}
                        size="small"
                        icon={<Category fontSize="small" />}
                        variant="outlined"
                      />
                    ))}
                    {item.categories.length > 2 && (
                      <Chip
                        label={`+${item.categories.length - 2}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small"
                    onClick={() => navigate(`/media/view/${item.id}`)}
                  >
                    View
                  </Button>
                  
                  {item.transcribed && (
                    <Button 
                      size="small"
                      onClick={() => navigate(`/media/transcript/${item.id}`)}
                    >
                      Transcript
                    </Button>
                  )}
                  
                  {!item.enhanced && (
                    <Button 
                      size="small"
                      onClick={() => navigate(`/media/enhance/${item.id}`)}
                    >
                      Enhance
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Box>
      </>
    );
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Media Library
          </Typography>
          
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => navigate('/media/upload')}
          >
            Upload Media
          </Button>
        </Box>
        
        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="My Media" />
            <Tab label="Processing" />
            <Tab label="All Media" />
          </Tabs>
        </Paper>
        
        <Box sx={{ mb: 4 }}>
          <form onSubmit={handleSearch}>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search media..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setSearchQuery('')}
                        >
                          {/* Clear icon */}
                          ✕
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={6} sm={3} md={2}>
                <FormControl fullWidth>
                  <InputLabel id="media-type-label">Media Type</InputLabel>
                  <Select
                    labelId="media-type-label"
                    value={mediaType}
                    label="Media Type"
                    onChange={(e) => setMediaType(e.target.value)}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="video">Video</MenuItem>
                    <MenuItem value="audio">Audio</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} sm={3} md={2}>
                <FormControl fullWidth>
                  <InputLabel id="sort-by-label">Sort By</InputLabel>
                  <Select
                    labelId="sort-by-label"
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <MenuItem value="date_desc">Newest First</MenuItem>
                    <MenuItem value="date_asc">Oldest First</MenuItem>
                    <MenuItem value="name_asc">Name A-Z</MenuItem>
                    <MenuItem value="name_desc">Name Z-A</MenuItem>
                    <MenuItem value="duration_desc">Longest First</MenuItem>
                    <MenuItem value="duration_asc">Shortest First</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Button 
                  type="submit" 
                  variant="outlined" 
                  fullWidth
                >
                  Apply Filters
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
        
        {renderContent()}
      </Box>
    </Container>
  );
};

export default MediaLibrary; 