export interface User {
  id: string;
  username: string;
  email: string;
  biometric_data?: {
    registered_at: string;
    verified: boolean;
    verification_id: string;
    last_verified?: string;
  };
} 