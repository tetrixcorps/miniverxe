# Tetrix - Enterprise AI Workflow Integration & Data Labeling Platform

A modern, full-stack platform for collaborative labeling, learning, and workflow management with role-based access control (RBAC).

## 🚀 Today's Implementation Summary

### What We Built
- **Complete React Web Application** with Vite build system
- **Firebase Authentication** with Google Sign-In
- **Tailwind CSS v3** for modern, responsive styling
- **Role-Based Access Control (RBAC)** system
- **Comprehensive Landing Page** with multiple sections
- **Monorepo Architecture** using pnpm workspaces

### Key Features Implemented
- ✅ Firebase Authentication (Google Sign-In)
- ✅ Responsive landing page with modern UI
- ✅ Role-based access control system
- ✅ Modal-based signup flow
- ✅ Tailwind CSS styling with custom brand colors
- ✅ React Router for navigation
- ✅ TypeScript support throughout
- ✅ Error boundaries and loading states

## 🏗️ Project Structure

```
tetrix/
├── apps/
│   └── web/                    # React web application
│       ├── src/
│       │   ├── components/     # Reusable UI components
│       │   ├── pages/          # Page components
│       │   ├── providers/      # Context providers
│       │   ├── hooks/          # Custom React hooks
│       │   ├── lib/            # Utilities and configurations
│       │   ├── modals/         # Modal components
│       │   └── styles/         # CSS and Tailwind config
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       └── postcss.config.cjs
├── packages/
│   └── rbac/                   # Role-based access control package
├── services/
│   └── api/                    # Backend API services
└── pnpm-workspace.yaml         # Monorepo configuration
```

## 🛠️ Technology Stack

### Frontend
- **React 19.1.0** - UI framework
- **Vite 7.0.0** - Build tool and dev server
- **TypeScript 5.8.3** - Type safety
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **React Router DOM 7.6.3** - Client-side routing
- **React Query 5.81.5** - Data fetching and caching

### Authentication & Backend
- **Firebase 11.10.0** - Authentication and database
- **Firebase Auth** - Google Sign-In integration
- **Firebase Firestore** - NoSQL database

### UI Components
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications
- **Nice Modal React** - Modal management
- **Class Variance Authority** - Component variants
- **Tailwind Merge** - Class merging utilities

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 🚀 Getting Started

### Prerequisites
- Node.js v23.11.0 or higher
- pnpm package manager
- Firebase project with authentication enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tetrix
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in `apps/web/`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server**
   ```bash
   cd apps/web
   pnpm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173/` (or the port shown in terminal)

## 📱 Available Routes

- **`/`** - Home page with feature overview
- **`/preview-landing/`** - Full landing page with all sections
- **`/dashboard`** - Main dashboard (requires authentication)
- **`/login`** - Login page
- **`/unauthorized`** - Access denied page

## 🎨 Styling & Design

### Brand Colors
- **Red**: `#FF3B30` - Primary brand color
- **Orange**: `#FF9500` - Secondary brand color
- **Yellow**: `#FFB300` - Accent color
- **Dark**: `#B71C1C` - Dark variant
- **Light**: `#FFF8E1` - Light variant

### Typography
- **Sans**: Inter font family
- **Heading**: Montserrat font family

### Custom Animations
- Gradient shift animations
- Glow pulse effects
- Letter float animations
- Sparkle effects
- Fade-in transitions

## 🔐 Authentication Flow

1. **User clicks "Sign Up"** on landing page
2. **Modal opens** with signup form
3. **Google Sign-In** integration via Firebase
4. **User authenticated** and redirected to dashboard
5. **Role-based permissions** applied based on user claims

## 🏛️ Architecture Decisions

### Why Tailwind CSS v3?
- **Stability**: v4 is still in alpha with breaking changes
- **Compatibility**: Better support for existing patterns
- **Documentation**: Comprehensive documentation and community support

### Why Firebase?
- **Rapid Development**: Quick authentication setup
- **Scalability**: Handles user growth automatically
- **Security**: Built-in security features
- **Real-time**: Live data synchronization

### Why Monorepo?
- **Code Sharing**: Shared packages between apps
- **Consistency**: Unified tooling and dependencies
- **Efficiency**: Single repository management

## 🐛 Troubleshooting

### Common Issues

**Firebase "projectId" not provided error**
- Ensure `.env` file is in `apps/web/` directory
- Verify all Firebase environment variables are set
- Restart the dev server after adding environment variables

**Tailwind CSS not working**
- Ensure you're using Tailwind v3 (not v4)
- Check that `postcss.config.cjs` uses `tailwindcss` plugin
- Verify `tailwind.config.js` is properly configured

**Authentication errors**
- Check Firebase project configuration
- Ensure Google Sign-In is enabled in Firebase Console
- Verify AuthProvider is wrapping the app in `main.tsx`

### Development Commands

```bash
# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Lint code
pnpm run lint
```

## 📦 Key Components

### Authentication
- `AuthProvider.tsx` - Global authentication state
- `useAuth.ts` - Authentication hook
- `SignupModal.tsx` - Signup modal component

### Landing Page
- `HeroSection.tsx` - Main hero section
- `FeaturesSection.tsx` - Feature highlights
- `TestimonialsSection.tsx` - Customer testimonials
- `CTASection.tsx` - Call-to-action section

### UI Components
- `Button.tsx` - Reusable button component
- `Card.tsx` - Card layout component
- `Navbar.tsx` - Navigation component
- `Footer.tsx` - Footer component

## 🔄 State Management

- **React Context** for authentication state
- **React Query** for server state management
- **Local state** for component-specific data

## 🚀 Deployment

The application is ready for deployment to:
- **Vercel** (recommended for React apps)
- **Netlify**
- **Firebase Hosting**
- **AWS Amplify**

## 📈 Next Steps

1. **Add more authentication providers** (GitHub, Microsoft)
2. **Implement user profile management**
3. **Add data labeling workflows**
4. **Integrate with external APIs**
5. **Add analytics and monitoring**
6. **Implement real-time collaboration features**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using React, Firebase, and Tailwind CSS**

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
