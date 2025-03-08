import React, { useState, useEffect } from 'react';
import { useApi } from '../../services/api';
import { Button, Card, Alert, Spinner } from '../ui';
import './GoogleDriveIntegration.css';

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  size: string;
  thumbnailLink?: string;
}

const GoogleDriveIntegration: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<GoogleDriveFile | null>(null);
  const [importOptions, setImportOptions] = useState({
    title: '',
    description: '',
    transcribe: false,
    translateTo: ''
  });
  
  const api = useApi();
  
  // Check if Google Drive is connected
  useEffect(() => {
    checkConnection();
  }, []);
  
  const checkConnection = async () => {
    try {
      const response = await api.get('/user/integrations');
      setIsConnected(response.data.connected_integrations.includes('google_drive'));
    } catch (err) {
      setError('Failed to check Google Drive connection');
    }
  };
  
  const connectGoogleDrive = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const response = await api.get('/integrations/google-drive/auth');
      window.location.href = response.data.auth_url;
    } catch (err) {
      setError('Failed to connect to Google Drive');
      setIsConnecting(false);
    }
  };
  
  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/integrations/google-drive/files');
      setFiles(response.data.files);
    } catch (err) {
      setError('Failed to load files from Google Drive');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectFile = (file: GoogleDriveFile) => {
    setSelectedFile(file);
    setImportOptions({
      ...importOptions,
      title: file.name
    });
  };
  
  const handleImportFile = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/integrations/google-drive/import/${selectedFile.id}`, {
        title: importOptions.title,
        description: importOptions.description,
        transcribe: importOptions.transcribe,
        translate_to: importOptions.translateTo
      });
      
      // Reset selection and reload files
      setSelectedFile(null);
      loadFiles();
      
      // Show success message
      alert(`Video "${importOptions.title}" imported successfully!`);
    } catch (err) {
      setError('Failed to import video from Google Drive');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load files when connected
  useEffect(() => {
    if (isConnected) {
      loadFiles();
    }
  }, [isConnected]);
  
  return (
    <div className="google-drive-integration">
      <h2>Google Drive Integration</h2>
      
      {error && <Alert type="error">{error}</Alert>}
      
      {!isConnected ? (
        <Card className="connection-card">
          <h3>Connect to Google Drive</h3>
          <p>Connect your Google Drive account to import videos directly.</p>
          <Button onClick={connectGoogleDrive} disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : 'Connect Google Drive'}
          </Button>
        </Card>
      ) : (
        <div className="drive-browser">
          <div className="file-list-header">
            <h3>Your Google Drive Videos</h3>
            <Button onClick={loadFiles} disabled={isLoading}>
              Refresh Files
            </Button>
          </div>
          
          {isLoading && !selectedFile ? (
            <div className="loading-container">
              <Spinner />
              <p>Loading files from Google Drive...</p>
            </div>
          ) : (
            <div className="file-list">
              {files.length === 0 ? (
                <div className="no-files">
                  No video files found in your Google Drive
                </div>
              ) : (
                files.map(file => (
                  <Card 
                    key={file.id} 
                    className={`file-card ${selectedFile?.id === file.id ? 'selected' : ''}`}
                    onClick={() => handleSelectFile(file)}
                  >
                    <div className="file-thumbnail">
                      {file.thumbnailLink ? (
                        <img src={file.thumbnailLink} alt={file.name} />
                      ) : (
                        <div className="placeholder-thumbnail">
                          <div className="video-icon">🎬</div>
                        </div>
                      )}
                    </div>
                    <div className="file-info">
                      <h4>{file.name}</h4>
                      <p>Type: {file.mimeType.split('/')[1]}</p>
                      <p>Size: {formatFileSize(parseInt(file.size || '0'))}</p>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
          
          {selectedFile && (
            <Card className="import-options">
              <h3>Import Options</h3>
              <p>Configure how you want to import "{selectedFile.name}"</p>
              
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  value={importOptions.title}
                  onChange={e => setImportOptions({...importOptions, title: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={importOptions.description}
                  onChange={e => setImportOptions({...importOptions, description: e.target.value})}
                />
              </div>
              
              <div className="form-group checkbox">
                <input
                  id="transcribe"
                  type="checkbox"
                  checked={importOptions.transcribe}
                  onChange={e => setImportOptions({...importOptions, transcribe: e.target.checked})}
                />
                <label htmlFor="transcribe">Transcribe video</label>
              </div>
              
              {importOptions.transcribe && (
                <div className="form-group">
                  <label htmlFor="translateTo">Translate to language (optional)</label>
                  <select
                    id="translateTo"
                    value={importOptions.translateTo}
                    onChange={e => setImportOptions({...importOptions, translateTo: e.target.value})}
                  >
                    <option value="">No translation</option>
                    <option value="eng">English</option>
                    <option value="fra">French</option>
                    <option value="swh">Swahili</option>
                    <option value="yor">Yoruba</option>
                    <option value="hau">Hausa</option>
                    <option value="amh">Amharic</option>
                    <option value="zul">Zulu</option>
                  </select>
                </div>
              )}
              
              <div className="action-buttons">
                <Button variant="outline" onClick={() => setSelectedFile(null)}>
                  Cancel
                </Button>
                <Button onClick={handleImportFile} disabled={isLoading}>
                  {isLoading ? 'Importing...' : 'Import Video'}
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  else return (bytes / 1073741824).toFixed(1) + ' GB';
};

export default GoogleDriveIntegration; 