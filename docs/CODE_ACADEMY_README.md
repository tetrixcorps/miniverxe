# TETRIX Code Academy - AI-Powered Learning Platform

## 🚀 Overview

TETRIX Code Academy is a comprehensive, enterprise-grade coding education platform that combines modern web technologies with AI-powered assistance to create an immersive learning experience. Built with a decoupled architecture, it features real-time collaboration, voice learning, and intelligent code review capabilities.

## 🏗️ Architecture

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React 18 + Vite + TypeScript | Modern, fast UI framework |
| **Styling** | Tailwind CSS + Framer Motion | Utility-first CSS with animations |
| **Backend** | Node.js + Express + TypeScript | Scalable server-side API |
| **Database** | PostgreSQL + Prisma ORM | Robust relational database |
| **Authentication** | JWT + TETRIX 2FA Integration | Secure user authentication |
| **AI Services** | OpenAI GPT-4 + SHANGO Agent | Intelligent coding assistance |
| **Speech-to-Text** | Deepgram API | Voice learning capabilities |
| **Real-time** | Socket.io | Live collaboration features |
| **Deployment** | Docker + DigitalOcean | Containerized deployment |

### System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend │◄──►│  Express Backend  │◄──►│  PostgreSQL DB  │
│   (Port 3000)   │    │   (Port 3001)    │    │   (Port 5432)   │
└─────────────────┘    └─────────┬────────┘    └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
            ┌───────▼──────┐ ┌───▼────┐ ┌────▼──────┐
            │ SHANGO AI    │ │Deepgram│ │  Socket.io│
            │ Agent        │ │  API   │ │  Real-time│
            └──────────────┘ └────────┘ └───────────┘
```

## 📁 Project Structure

```
tetrix/
├── src/
│   ├── components/
│   │   ├── CodeAcademyModal.astro    # Code Academy modal component
│   │   └── layout/
│   │       └── Header.astro          # Updated with Code Academy button
│   └── pages/
│       └── code-academy.astro        # Code Academy landing page
├── code-academy-backend/             # Backend API
│   ├── src/
│   │   ├── routes/                   # API routes
│   │   ├── services/                 # Business logic
│   │   ├── middleware/               # Express middleware
│   │   └── utils/                    # Utility functions
│   ├── prisma/
│   │   └── schema.prisma             # Database schema
│   └── package.json
├── code-academy-frontend/            # React frontend
│   ├── src/
│   │   ├── components/               # React components
│   │   ├── pages/                    # Page components
│   │   ├── services/                 # API services
│   │   ├── store/                    # State management
│   │   └── types/                    # TypeScript types
│   └── package.json
└── CODE_ACADEMY_README.md           # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- PostgreSQL 14+
- Docker (optional)
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd code-academy-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd code-academy-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tetrix_code_academy"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=30d

# 2FA Integration
TETRIX_2FA_API_URL=https://tetrixcorp.com/api/2fa
TETRIX_2FA_API_KEY=your-tetrix-2fa-api-key

# AI Services
OPENAI_API_KEY=your-openai-api-key
DEEPGRAM_API_KEY=your-deepgram-api-key
SHANGO_API_URL=https://tetrixcorp.com/api/shang
SHANGO_API_KEY=your-shango-api-key

# CORS
CORS_ORIGIN=http://localhost:3000,https://tetrixcorp.com
```

#### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
VITE_APP_NAME=TETRIX Code Academy
```

## 🎯 Features

### Core Learning Features

- **📚 Interactive Courses**: Hands-on coding exercises with instant feedback
- **🤖 AI-Powered Assistance**: SHANGO AI agent for real-time help and code review
- **🎤 Voice Learning**: Speech-to-text integration for hands-free learning
- **👥 Real-time Collaboration**: Live coding sessions with peers
- **📊 Progress Tracking**: Detailed analytics and learning paths
- **🏆 Gamification**: Achievements, levels, and leaderboards

### Enterprise Features

- **🔐 2FA Authentication**: Integrated with TETRIX 2FA system
- **🏢 Team Management**: Organization-level user management
- **📈 Analytics Dashboard**: Comprehensive learning analytics
- **🔒 Security**: SOC II compliant with enterprise-grade security
- **🌐 Multi-language Support**: 50+ languages supported
- **📱 Responsive Design**: Works on all devices

### AI Capabilities

- **Code Review**: Automated code quality assessment
- **Exercise Generation**: AI-generated coding challenges
- **Voice Commands**: Natural language interaction
- **Personalized Learning**: Adaptive learning paths
- **Real-time Help**: Instant answers to coding questions

## 🗄️ Database Schema

### Key Tables

- **Users**: User accounts and authentication
- **UserProfiles**: Extended user information and preferences
- **Courses**: Course content and metadata
- **Lessons**: Individual lesson content
- **Exercises**: Coding exercises and challenges
- **Submissions**: Student code submissions
- **Progress**: Learning progress tracking
- **Collaborations**: Real-time collaboration sessions
- **Messages**: Chat and AI interaction history

### Relationships

- Users have one UserProfile
- Courses contain multiple Lessons
- Lessons contain multiple Exercises
- Users can enroll in multiple Courses
- Progress tracks completion of Courses, Lessons, and Exercises
- Collaborations enable real-time coding sessions

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-2fa` - 2FA verification
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (admin)
- `PUT /api/courses/:id` - Update course (admin)
- `DELETE /api/courses/:id` - Delete course (admin)

### Learning
- `GET /api/lessons/:id` - Get lesson content
- `GET /api/exercises/:id` - Get exercise details
- `POST /api/submissions` - Submit code
- `GET /api/progress` - Get user progress
- `POST /api/progress` - Update progress

### AI Services
- `POST /api/ai/assistance` - Get AI coding help
- `POST /api/ai/review` - Code review
- `POST /api/ai/transcribe` - Speech-to-text
- `POST /api/ai/generate` - Generate exercises

### Collaboration
- `GET /api/collaboration/rooms` - List collaboration rooms
- `POST /api/collaboration/rooms` - Create room
- `GET /api/collaboration/rooms/:id` - Get room details

## 🚀 Deployment

### Docker Deployment

1. **Build backend image:**
   ```bash
   cd code-academy-backend
   docker build -t tetrix-code-academy-backend .
   ```

2. **Build frontend image:**
   ```bash
   cd code-academy-frontend
   docker build -t tetrix-code-academy-frontend .
   ```

3. **Run with docker-compose:**
   ```bash
   docker-compose up -d
   ```

### DigitalOcean App Platform

1. **Backend deployment:**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set run command: `npm start`
   - Configure environment variables

2. **Frontend deployment:**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Configure environment variables

## 🧪 Testing

### Backend Testing
```bash
cd code-academy-backend
npm test
npm run test:watch
```

### Frontend Testing
```bash
cd code-academy-frontend
npm test
npm run test:watch
```

### E2E Testing
```bash
npm run test:e2e
```

## 📊 Monitoring

### Health Checks
- Backend: `GET /health`
- Database connectivity
- AI service availability
- WebSocket connections

### Logging
- Winston logger with multiple transports
- Structured logging with context
- Error tracking and alerting
- Performance metrics

## 🔒 Security

### Authentication & Authorization
- JWT-based authentication
- 2FA integration with TETRIX
- Role-based access control
- Session management

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

### Compliance
- SOC II Type II compliant
- GDPR compliant
- Data encryption at rest and in transit
- Audit logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- Documentation: [docs.tetrixcorp.com](https://docs.tetrixcorp.com)
- Support: [support@tetrixcorp.com](mailto:support@tetrixcorp.com)
- Community: [Discord](https://discord.gg/tetrix)

## 🎉 Acknowledgments

- OpenAI for GPT-4 integration
- Deepgram for speech-to-text services
- Prisma for database ORM
- React team for the amazing framework
- Tailwind CSS for utility-first styling
- Framer Motion for smooth animations

---

**Built with ❤️ by the TETRIX Team**
