# Data Labeling API

A comprehensive API service for data labeling and annotation platform built with Node.js, Express, Prisma, and Firebase.

## 🚀 Features

- **Complete Authentication System** with Firebase
- **Data Labeling & Annotation** management
- **Academy & Learning System** for user training
- **Analytics & Reporting** with real-time metrics
- **Contact Management** system
- **Multi-tenant Organization** support
- **Role-based Access Control** (RBAC)
- **Comprehensive Database Schema** with Prisma

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Firebase project with authentication enabled
- npm or yarn package manager

## 🛠️ Installation

1. **Clone and navigate to the API directory:**
   ```bash
   cd services/api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/data_labeling?schema=public"
   
   # Firebase Configuration
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_PRIVATE_KEY=your-private-key
   
   # API Configuration
   PORT=4000
   NODE_ENV=development
   ```

4. **Set up the database:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:4000`

## 📚 API Endpoints

### 🔐 Authentication (`/auth`)
- `POST /auth/login` - Login with Firebase token
- `POST /auth/register` - Register new user
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user info
- `PATCH /auth/profile` - Update user profile
- `POST /auth/forgot-password` - Password reset
- `POST /auth/change-password` - Change password

### 📊 Data Labeling (`/data-labeling`)
- `GET /data-labeling/tasks` - List all labeling tasks
- `POST /data-labeling/tasks` - Create new task
- `GET /data-labeling/tasks/:id` - Get specific task
- `PATCH /data-labeling/tasks/:id` - Update task
- `GET /data-labeling/stats` - Get labeling statistics
- `POST /data-labeling/tasks/batch` - Batch operations

### 🏷️ Data Annotator (`/data-annotator`)
- `GET /data-annotator/my-tasks` - Get assigned tasks
- `POST /data-annotator/claim-task/:id` - Claim available task
- `POST /data-annotator/submit-annotation/:id` - Submit annotation
- `GET /data-annotator/available-tasks` - Get available tasks
- `GET /data-annotator/performance` - Get performance metrics
- `GET /data-annotator/history` - Get task history

### 🎓 Academy (`/academy`)
- `GET /academy/assignments` - Get user assignments
- `POST /academy/assignments` - Create assignment (admin)
- `GET /academy/assignments/:id` - Get specific assignment
- `POST /academy/assignments/:id/submit` - Submit assignment
- `GET /academy/courses` - Get available courses
- `GET /academy/leaderboard` - Get leaderboard
- `GET /academy/progress` - Get user progress

### 📞 Contact (`/contact`)
- `POST /contact` - Submit contact form
- `GET /contact` - Get all submissions (admin)
- `GET /contact/:id` - Get specific submission (admin)
- `PATCH /contact/:id` - Update submission status (admin)
- `GET /contact/stats/overview` - Get contact statistics

### 📈 Analytics (`/api`)
- `GET /api/metrics` - Get analytics metrics
- `GET /api/stats` - Get system statistics
- `GET /api/user-performance` - Get user performance
- `GET /api/project-performance` - Get project analytics
- `GET /api/quality-metrics` - Get quality metrics

### 👥 Users (`/users`)
- `GET /users` - List all users (admin)
- `GET /users/me` - Get current user profile
- `GET /users/:id` - Get specific user (admin)
- `PATCH /users/:id` - Update user (admin)
- `POST /users` - Create new user (admin)
- `DELETE /users/:id` - Delete user (admin)

### 📋 Projects (`/projects`)
- `GET /projects` - List all projects
- `POST /projects` - Create new project
- `GET /projects/:id` - Get specific project
- `PATCH /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project (admin)

### 🎫 Tickets (`/tickets`)
- `GET /tickets` - List assigned tickets
- `POST /tickets/:id/claim` - Claim task item
- `POST /tickets/:id/submit` - Submit annotation
- `PATCH /tickets/:id/review` - Review annotation (admin/reviewer)

### 💳 Wallet (`/wallet`)
- `POST /wallet/create` - Create wallet for user
- `POST /wallet/payout` - Trigger payout (admin)

## 🔑 Authentication

The API uses Firebase Authentication. Include the Firebase ID token in the Authorization header:

```bash
Authorization: Bearer <firebase-id-token>
```

## 👥 User Roles

- **ADMIN** - Full system access
- **PROJECT_MANAGER** - Manage projects and tasks
- **REVIEWER** - Review and approve annotations
- **ANNOTATOR** - Perform data annotation tasks
- **ACADEMY_STUDENT** - Access learning materials

## 🗄️ Database Schema

The API uses Prisma ORM with the following main models:

- **User** - User accounts and profiles
- **Organization** - Multi-tenant organization support
- **Project** - Annotation projects
- **Task** - Individual annotation tasks
- **Review** - Quality control reviews
- **Analytics** - Performance metrics
- **Billing** - Payment and billing records
- **Wallet** - User wallet information
- **ContactSubmission** - Contact form submissions
- **AcademyAssignment** - Learning assignments

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 📝 Development

### Database Commands

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset

# Generate Prisma client after schema changes
npx prisma generate

# Deploy migrations to production
npx prisma migrate deploy
```

### Code Structure

```
src/
├── routes/          # API route handlers
├── middleware/      # Authentication and authorization
├── db.ts           # Database client configuration
├── firebase.ts     # Firebase configuration
└── index.ts        # Main application entry point
```

## 🚀 Production Deployment

1. **Set up production database:**
   ```bash
   # Run migrations
   npx prisma migrate deploy
   ```

2. **Configure environment variables** for production

3. **Build and start:**
   ```bash
   npm run build
   npm start
   ```

## 📊 Monitoring & Logging

- Health check endpoint: `GET /health`
- All endpoints include comprehensive error logging
- Performance metrics available through analytics endpoints

## 🔧 Configuration

Key configuration options in `.env`:

- `DATABASE_URL` - PostgreSQL connection string
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - Firebase service account email
- `FIREBASE_PRIVATE_KEY` - Firebase service account private key
- `PORT` - API server port (default: 4000)
- `NODE_ENV` - Environment (development/production)

## 📖 API Documentation

For detailed API documentation with request/response examples, visit:
- Swagger/OpenAPI documentation (coming soon)
- Postman collection (coming soon)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting guide

---

**Note:** This API service is part of a larger data labeling platform. Make sure to also set up the frontend application and any required external services.