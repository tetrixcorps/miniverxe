import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/tailwind.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NiceModal from '@ebay/nice-modal-react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './providers/AuthProvider';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <NiceModal.Provider>
        <AuthProvider>
          <App />
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </AuthProvider>
      </NiceModal.Provider>
    </QueryClientProvider>
  </React.StrictMode>
);
