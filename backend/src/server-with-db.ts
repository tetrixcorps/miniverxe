import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import tetrixAuthRoutes from './routes/tetrixAuth';
import tetrixAuthSessionsRoutes from './routes/tetrixAuthSessions';
import dashboardRoutes from './routes/dashboard';
import voiceRoutes from './routes/voice';
import voiceMonitoringRoutes from './routes/voiceMonitoring';
import enterprise2FARoutes from './routes/enterprise2FA';
import unifiedAuthRoutes from './routes/unifiedAuth';
import authLookupRoutes from './routes/authLookup';
import cookieParser from 'cookie-parser';
import { auth } from './auth';
import { toNodeHandler } from 'better-auth/node';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const app = express();
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Middleware
app.use(cors({
  origin: process.env['CORS_ORIGIN']?.split(',') || ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:8082'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());
app.use(cookieParser()); // Enable cookie parsing for session management

// Better Auth API routes - handles all /api/auth/* endpoints
app.all("/api/auth/*", toNodeHandler(auth));

// Health check
app.get('/health', (req, res) => {
  return res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// JWT helper functions
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env['JWT_SECRET'] || 'fallback-secret',
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env['REFRESH_TOKEN_SECRET'] || 'fallback-refresh-secret',
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Auth middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env['JWT_SECRET'] || 'fallback-secret', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// LEGACY ROUTE - Email/Password registration (NOT COMPATIBLE WITH BETTER AUTH SCHEMA)
// Better Auth uses phone-based authentication. This route is disabled.
// Use /api/v2/2fa/initiate and /api/v2/2fa/verify instead
/*
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, company, role } = req.body;
    
    // Validation
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        first_name,
        last_name,
        phone: phone || null,
        company: company || null,
        role: role || 'USER',
      }
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    return res.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        company: user.company,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});
*/

// LEGACY ROUTE - Email/Password login (NOT COMPATIBLE WITH BETTER AUTH SCHEMA)
// Better Auth uses phone-based authentication. This route is disabled.
// Use /api/v2/2fa/initiate and /api/v2/2fa/verify instead
/*
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(401).json({ error: 'Account is not active' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() }
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        company: user.company,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});
*/

// LEGACY ROUTE - Phone verification (REPLACED BY BETTER AUTH)
// Use /api/v2/2fa/initiate and /api/v2/2fa/verify instead
/*
app.post('/api/auth/verify/phone/initiate', async (req, res) => {
  try {
    const { phoneNumber, countryCode, verificationType = 'sms' } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    // Generate verification code (mock for now)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store verification session using Better Auth Verification model
    // Note: Better Auth handles verification internally, this is legacy code
    // For now, we'll use a simple in-memory store or skip this
    const session = {
      id: `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        verification_code: verificationCode,
        expires_at: expiresAt
    };

    // In production, you would send the code via Telnyx API
    // For now, we'll return it in the response (development only)
    return res.json({
      success: true,
      verificationId: session.id,
      message: `Verification code sent to ${phoneNumber}`,
      // Remove this in production
      debugCode: process.env['NODE_ENV'] === 'development' ? verificationCode : undefined
    });
  } catch (error) {
    console.error('Phone verification error:', error);
    return res.status(500).json({ error: 'Failed to initiate verification' });
  }
});
*/

// LEGACY ROUTE - Phone verification check (REPLACED BY BETTER AUTH)
// Use /api/v2/2fa/verify instead
/*
app.post('/api/auth/verify/phone/check', async (req, res) => {
  try {
    const { verificationId, code } = req.body;
    
    if (!verificationId || !code) {
      return res.status(400).json({ error: 'Verification ID and code required' });
    }

    // Find verification session using Better Auth Verification model
    // Note: Better Auth handles verification internally, this is legacy code
    // For now, we'll use Better Auth's verification check
    const verification = await prisma.verification.findUnique({
      where: { id: verificationId }
    });

    if (!verification) {
      return res.status(404).json({ error: 'Verification session not found' });
    }

    // Check if expired
    if (new Date() > verification.expiresAt) {
      return res.status(400).json({ error: 'Verification code expired' });
    }

    // Verify code
    if (verification.value !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    return res.json({
      success: true,
      verified: true,
      message: 'Phone number verified successfully'
    });
  } catch (error) {
    console.error('Phone verification check error:', error);
    return res.status(500).json({ error: 'Failed to verify code' });
  }
});
*/

// Get supported countries for phone formatting (200+ countries via Telnyx)
app.get('/api/tetrix/auth/countries', (req, res) => {
  return res.json({
    success: true,
    countries: [
      { code: '+1', name: 'United States 🇺🇸', callingCode: '+1' },
      { code: '+1', name: 'Canada 🇨🇦', callingCode: '+1' },
      { code: '+44', name: 'United Kingdom 🇬🇧', callingCode: '+44' },
      { code: '+61', name: 'Australia 🇦🇺', callingCode: '+61' },
      { code: '+64', name: 'New Zealand 🇳🇿', callingCode: '+64' },
      { code: '+27', name: 'South Africa 🇿🇦', callingCode: '+27' },
      { code: '+971', name: 'UAE 🇦🇪', callingCode: '+971' },
      { code: '+966', name: 'Saudi Arabia 🇸🇦', callingCode: '+966' },
      { code: '+33', name: 'France 🇫🇷', callingCode: '+33' },
      { code: '+49', name: 'Germany 🇩🇪', callingCode: '+49' },
      { code: '+39', name: 'Italy 🇮🇹', callingCode: '+39' },
      { code: '+34', name: 'Spain 🇪🇸', callingCode: '+34' },
      { code: '+31', name: 'Netherlands 🇳🇱', callingCode: '+31' },
      { code: '+32', name: 'Belgium 🇧🇪', callingCode: '+32' },
      { code: '+41', name: 'Switzerland 🇨🇭', callingCode: '+41' },
      { code: '+43', name: 'Austria 🇦🇹', callingCode: '+43' },
      { code: '+45', name: 'Denmark 🇩🇰', callingCode: '+45' },
      { code: '+46', name: 'Sweden 🇸🇪', callingCode: '+46' },
      { code: '+47', name: 'Norway 🇳🇴', callingCode: '+47' },
      { code: '+358', name: 'Finland 🇫🇮', callingCode: '+358' },
      { code: '+48', name: 'Poland 🇵🇱', callingCode: '+48' },
      { code: '+353', name: 'Ireland 🇮🇪', callingCode: '+353' },
      { code: '+351', name: 'Portugal 🇵🇹', callingCode: '+351' },
      { code: '+30', name: 'Greece 🇬🇷', callingCode: '+30' },
      { code: '+90', name: 'Turkey 🇹🇷', callingCode: '+90' },
      { code: '+7', name: 'Russia 🇷🇺', callingCode: '+7' },
      { code: '+380', name: 'Ukraine 🇺🇦', callingCode: '+380' },
      { code: '+86', name: 'China 🇨🇳', callingCode: '+86' },
      { code: '+81', name: 'Japan 🇯🇵', callingCode: '+81' },
      { code: '+82', name: 'South Korea 🇰🇷', callingCode: '+82' },
      { code: '+886', name: 'Taiwan 🇹🇼', callingCode: '+886' },
      { code: '+852', name: 'Hong Kong 🇭🇰', callingCode: '+852' },
      { code: '+65', name: 'Singapore 🇸🇬', callingCode: '+65' },
      { code: '+60', name: 'Malaysia 🇲🇾', callingCode: '+60' },
      { code: '+66', name: 'Thailand 🇹🇭', callingCode: '+66' },
      { code: '+62', name: 'Indonesia 🇮🇩', callingCode: '+62' },
      { code: '+63', name: 'Philippines 🇵🇭', callingCode: '+63' },
      { code: '+84', name: 'Vietnam 🇻🇳', callingCode: '+84' },
      { code: '+91', name: 'India 🇮🇳', callingCode: '+91' },
      { code: '+92', name: 'Pakistan 🇵🇰', callingCode: '+92' },
      { code: '+880', name: 'Bangladesh 🇧🇩', callingCode: '+880' },
      { code: '+52', name: 'Mexico 🇲🇽', callingCode: '+52' },
      { code: '+55', name: 'Brazil 🇧🇷', callingCode: '+55' },
      { code: '+54', name: 'Argentina 🇦🇷', callingCode: '+54' },
      { code: '+56', name: 'Chile 🇨🇱', callingCode: '+56' },
      { code: '+57', name: 'Colombia 🇨🇴', callingCode: '+57' },
      { code: '+51', name: 'Peru 🇵🇪', callingCode: '+51' },
      { code: '+58', name: 'Venezuela 🇻🇪', callingCode: '+58' },
      { code: '+20', name: 'Egypt 🇪🇬', callingCode: '+20' },
      { code: '+234', name: 'Nigeria 🇳🇬', callingCode: '+234' },
      { code: '+254', name: 'Kenya 🇰🇪', callingCode: '+254' },
      { code: '+233', name: 'Ghana 🇬🇭', callingCode: '+233' },
      { code: '+972', name: 'Israel 🇮🇱', callingCode: '+972' }
    ],
    total: 55,
    message: 'Telnyx Verify API supports 200+ countries globally. These are the most common options.'
  });
});

// Dashboard metrics
app.get('/api/dashboard/metrics/universal', authenticateToken, async (req, res) => {
  try {
    // Get user count
    const userCount = await prisma.user.count();
    
    return res.json({
      success: true,
      data: {
        activeUsers: userCount,
        totalRevenue: 125000,
        systemUptime: 99.9,
        recentActivity: [],
        notifications: []
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Universal metrics error:', error);
    return res.status(500).json({ error: 'Failed to fetch universal metrics' });
  }
});

// Industry-specific metrics
app.get('/api/dashboard/metrics/:industry', authenticateToken, async (req, res) => {
  try {
    const { industry } = req.params;
    
    let metrics = {};
    
    if (industry === 'healthcare') {
      metrics = {
        patientsToday: 48,
        appointmentsScheduled: 32,
        emergencyCases: 3,
        patientSatisfaction: 4.8
      };
    } else if (industry === 'construction') {
      metrics = {
        activeProjects: 12,
        completedThisMonth: 8,
        safetyAlerts: 2,
        workersOnSite: 45
      };
    } else if (industry === 'logistics') {
      metrics = {
        activeVehicles: 25,
        deliveriesToday: 150,
        avgDeliveryTime: 2.5,
        alerts: 1
      };
    }

    return res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Industry metrics error:', error);
    return res.status(500).json({ error: 'Failed to fetch industry metrics' });
  }
});

// Products endpoint
app.get('/api/dashboard/products/:industry', authenticateToken, async (req, res) => {
  try {
    const { industry } = req.params;
    
    const products = [
      { id: 'prod_health_001', name: 'Patient Management System', description: 'Comprehensive patient management solution', price: 299.99, features: ['patient_records', 'appointment_scheduling', 'billing'], category: 'management' },
      { id: 'prod_health_002', name: 'Epic Integration', description: 'Seamless Epic EHR integration', price: 499.99, features: ['ehr_integration', 'data_sync', 'compliance'], category: 'integration' },
      { id: 'prod_const_001', name: 'Project Tracking Software', description: 'Track construction projects in real-time', price: 199.99, features: ['project_status', 'task_management', 'reporting'], category: 'software' },
      { id: 'prod_log_001', name: 'Fleet Optimization Suite', description: 'Optimize routes and manage drivers', price: 399.99, features: ['route_optimization', 'driver_management', 'gps_tracking'], category: 'software' },
    ];
    
    const filteredProducts = products.filter(p => p.id.includes(industry.substring(0, 4)));

    return res.json({
      success: true,
      industry,
      products: filteredProducts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Products error:', error);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// TETRIX Auth routes
// New session-based routes (with secure cookies) - mounts first for priority
app.use('/api/tetrix', tetrixAuthSessionsRoutes);
// Legacy routes (maintained for backward compatibility during migration)
app.use('/api/tetrix', tetrixAuthRoutes);

// Dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// Voice processing routes
app.use('/api/voice', voiceRoutes);

// Voice monitoring routes
app.use('/api/voice/monitoring', voiceMonitoringRoutes);

// Unified Auth routes (Better Auth + Enterprise 2FA) - primary endpoints
app.use('/api/v2/2fa', unifiedAuthRoutes);

// Auth lookup routes (user existence check)
app.use('/api/v2/auth', authLookupRoutes);

// Enterprise 2FA routes - legacy support (maintained for backward compatibility)
app.use('/api/enterprise-2fa', enterprise2FARoutes);

// Better Auth routes - direct access to Better Auth endpoints
// These are also available through unified routes above

const PORT = parseInt(process.env['PORT'] || '3001');
const HOST = process.env['HOST'] || '0.0.0.0';

// Test database connection before starting server
async function startServer() {
  try {
    // Test Prisma connection
    await prisma.$connect();
    console.log('✅ Database connection established');
    
    // Start server
    app.listen(PORT, HOST, () => {
      console.log(`🚀 TETRIX Backend Server running on http://${HOST}:${PORT}`);
      console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
      console.log(`🔐 Better Auth: http://${HOST}:${PORT}/api/auth`);
      console.log(`🔍 User Lookup: http://${HOST}:${PORT}/api/v2/auth/lookup`);
      console.log(`📱 Unified 2FA: http://${HOST}:${PORT}/api/v2/2fa`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer().catch((error) => {
  console.error('❌ Fatal error starting server:', error);
  process.exit(1);
});

export default app;
