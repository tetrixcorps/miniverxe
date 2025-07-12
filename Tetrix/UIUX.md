# You will act as a development team, which consists of a frontend developer, UI/UX designer and a backend developer to build this software engineering firm website using the specifications attached. Replace the Supabase components with the Google Firestore.



Startup Services Landing Page with Gradient Design
</summary_title>

<image_analysis>

1. Navigation Elements:
- Top header with: Contact information (phone, email, address)
- Main navigation with: Home, About, Solutions, Services, Contact
- CTA button: "Get in Touch" in top right
- Logo placement in top left


2. Layout Components:
- Full-width header: 100vw x 60px
- Main content area: 100vw x ~70vh
- Logo container: 200px width
- Navigation menu: ~600px width
- Gradient background spanning full viewport


3. Content Sections:
- Hero section with large heading "Services"
- Subheading descriptive text
- Technology partner logos (Tiktok, AWS, NVIDIA)
- "Using Amazing Technologies" text overlay
- Dual CTA buttons: "Get in Touch" and "View Works"


4. Interactive Controls:
- Primary CTA button: Dark background with light text
- Secondary CTA button: Light background with dark text
- Navigation menu items with hover states
- Interactive logo section with partner brands


5. Colors:
- Background gradient: #FFF8E7 to #E8F5E9
- Text: #1E1E1E
- CTA buttons: #2A2A2A
- Navigation background: rgba(42, 42, 42, 0.8)


6. Grid/Layout Structure:
- 12-column grid system
- Main content: 1200px max-width
- Responsive padding: 24px mobile, 48px desktop
- Flexible hero section with 2-column layout
</image_analysis>

<development_planning>

1. Project Structure:
```
src/
├── components/
│   ├── layout/
│   │   ├── Header
│   │   ├── Navigation
│   │   └── Footer
│   ├── features/
│   │   ├── Hero
│   │   ├── Partners
│   │   └── CTASection
│   └── shared/
├── assets/
├── styles/
├── hooks/
└── utils/
```


2. Key Features:
- Responsive navigation system
- Gradient background animation
- Partner logo carousel/grid
- Contact form integration
- Smooth scroll navigation


3. State Management:
```typescript
interface AppState {
├── navigation: {
│   ├── isMenuOpen: boolean
│   ├── activeSection: string
│   └── scrollPosition: number
├── }
├── contact: {
│   ├── formData: ContactForm
│   └── submitStatus: string
├── }
}
```


4. Routes:
```typescript
const routes = [
├── '/',
├── '/about',
├── '/solutions',
├── '/services',
└── '/contact'
]
```


5. Component Architecture:
- Header (container)
├── Navigation
├── ContactInfo
├── CTAButton
- Hero (container)
├── HeadingSection
├── SubheadingText
├── CTAGroup
- Partners (container)
├── PartnerGrid
└── TechnologyText


6. Responsive Breakpoints:
```scss
$breakpoints: (
├── 'mobile': 320px,
├── 'tablet': 768px,
├── 'desktop': 1024px,
└── 'wide': 1440px
);
```
</development_planning>



Structure based on navigation menu items (excluding main route). Make sure to wrap all routes with the component:

Routes:
- /contact-information-phone
- /email
- /address
- /home
- /about
- /solutions
- /services
- /contact

Page Implementations:
/contact-information-phone:
Core Purpose: Display company phone contact details and call options
Key Components
- Phone number display with click-to-call functionality
- Business hours indicator
- Department contact list
- Call-back request form
Layout Structure
- Single column layout
- Sticky header with phone number
- Scrollable department list
- Mobile-first design with tap-to-call buttons

/email:
Core Purpose: Provide email contact options and form submission
Key Components
- Email contact form
- Department email directory
- Email templates for common inquiries
- Response time expectations
Layout Structure
- Two-column desktop layout
- Single column mobile layout
- Floating validation messages
- Progressive form sections

/address:
Core Purpose: Show physical location and directions
Key Components
- Interactive map
- Written directions
- Public transport options
- Parking information
Layout Structure
- Map takes 50% of viewport
- Address details sidebar
- Expandable transport options
- Responsive map sizing

/home:
Core Purpose: Main landing page showcasing key offerings
Key Components
- Hero section with CTA
- Featured services carousel
- News

/updates section
- Testimonials
Layout Structure:
- Full-width hero
- Grid-based content sections
- Sticky navigation
- Mobile-optimized content blocks

/about:
Core Purpose: Company information and history
Key Components
- Company timeline
- Team profiles
- Mission statement
- Values section
Layout Structure
- Narrative scroll layout
- Side navigation for sections
- Image galleries
- Responsive text columns

/solutions:
Core Purpose: Showcase product

/service solutions
Key Components:
- Solution categories
- Case studies
- Implementation process
- Pricing tables
Layout Structure
- Card-based grid layout
- Filtering system
- Comparison tables
- Mobile-friendly cards

/services:
Core Purpose: Detailed service offerings
Key Components
- Service catalog
- Booking

/inquiry forms
- Service comparison tool
- FAQ section
Layout Structure:
- Service cards grid
- Sticky category navigation
- Expandable service details
- Mobile-optimized booking forms

/contact:
Core Purpose: Central contact hub
Key Components
- Universal contact form
- Contact method options
- Live chat widget
- Support ticket system
Layout Structure
- Multi-section layout
- Progressive contact form
- Floating chat widget
- Mobile-first contact options

Layouts:
MainLayout:
- Applicable routes: All routes
- Core components
  - Header with navigation
  - Footer with site map
  - Breadcrumb navigation
  - Mobile menu
- Responsive behavior
  - Collapsible navigation on mobile
  - Fluid container widths
  - Dynamic spacing
  - Flexible content areas

ContactLayout
- Applicable routes: /contact-information-phone, /email, /address, /contact
- Core components
  - Contact method selector
  - Social media links
  - Contact form wrapper
  - Support status indicator
- Responsive behavior
  - Stack elements on mobile
  - Maintain form usability
  - Adjust input sizes
  - Preserve tap targets

ContentLayout
- Applicable routes: /home, /about, /solutions, /services
- Core components
  - Page header
  - Content area
  - Side navigation
  - Related content
- Responsive behavior
  - Collapse side navigation
  - Adjust typography
  - Reflow content blocks
  - Optimize images


## **Project Architecture Overview**

TETRIX will be built using Astro (Islands architecture) with Tailwind CSS, Lucide React icons, and Google Firestore for authentication and data management. The site serves as a SaaS marketing platform with user authentication, CRM dashboard, and ticket management system.

## **1. UI/UX Design Documentation**

### **Brand \& Visual Identity**

- **Logo**: Centralized on static pages, top-left in navigation; geometric and modern design reflecting "TETRIX"
- **Color Palette**: Gradient background from \#FFF8E7 to \#E8F5E9; text \#1E1E1E; CTA buttons \#2A2A2A; navigation background rgba(42,42,42,0.8)[^1]
- **Typography**: Sans-serif, 2.5rem hero titles, 1.25rem body text, consistent 12px base spacing[^1]
- **Imagery**: Stock images from `picsum.photos` with configured remotePatterns[^1]


### **Layout Structure**

- **Header**: Full-width 60px height with logo (left), main navigation (center), contact info (top), CTA button (right)[^1]
- **Navigation**: Home, About, Solutions, Services, Contact; sticky desktop, collapsible mobile[^1]
- **Grid System**: 12-column layout, max-width 1200px, responsive padding (24px mobile, 48px desktop)[^1]
- **Hero Section**: 2-column layout on tablet/desktop with partner logos (Framer, AWS, NVIDIA)[^1]


### **Component Library**

- **Buttons**: Primary (dark bg, light text), Secondary (light bg, dark text) with Lucide icons[^1]
- **Forms**: Inline validation, floating error messages, progressive multi-step flows[^1]
- **Cards**: Service grids, solution showcases, testimonials, partner displays[^1]
- **Interactive Elements**: Click-to-call, email forms, live chat, support ticket submission[^1]


## **2. Frontend Development Guide**

### **Project Structure**

```plaintext
src/
├── components/
│   ├── layout/ (Header, Navigation, Footer)
│   ├── features/ (Hero, Partners, CTASection)
│   ├── auth/ (AuthForm, ProtectedRoute)
│   └── shared/ (Buttons, FormControls)
├── pages/
│   ├── index.astro (Home)
│   ├── about.astro
│   ├── solutions.astro
│   ├── services.astro
│   ├── contact.astro
│   ├── contact-information-phone.astro
│   ├── email.astro
│   ├── address.astro
│   ├── onboarding.astro (SignUp/SignIn)
│   └── dashboard/ (CRM dashboard, protected)
├── lib/ (firebase.ts, firestore.ts)
├── styles/
└── utils/
```


### **Key Components Implementation**

- **Layout**: Root layout wraps all pages with navigation and global styles[^1]
- **Navigation**: Responsive with hover states and Lucide icons, collapsible on mobile[^1]
- **Hero Section**: Large heading, subheading, partner logos, dual CTA buttons[^1]
- **Protected Routes**: Middleware guards `/dashboard` routes, redirects unauthenticated users[^1]


### **Styling Guidelines**

- Tailwind CSS utility classes exclusively (no other UI libraries except Lucide React)[^1]
- Responsive breakpoints: mobile (320px), tablet (768px), desktop (1024px), wide (1440px)[^1]
- Image optimization using Astro's `<Image>` component with picsum.photos remotePatterns[^1]


## **3. Backend \& Authentication (Google Firestore)**

### **Firebase/Firestore Setup**

Create a Firebase project and enable Firestore database in production mode[^10]. Configure authentication providers (Email/Password, Google OAuth) in the Firebase console[^7].

```javascript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```


### **Environment Variables**

```env
PUBLIC_FIREBASE_API_KEY=your-api-key
PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your-project-id
PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
PUBLIC_FIREBASE_APP_ID=your-app-id
```


### **Authentication Implementation**

```typescript
// src/lib/auth.ts
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase';

export const firebaseCreateUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const firebaseSignIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const firebaseSignOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};
```


### **Firestore Data Structure**

```typescript
// Collections Structure
interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  role: 'user' | 'admin';
}

interface Ticket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}
```


### **Firestore Operations**

```typescript
// src/lib/firestore.ts
import { collection, doc, addDoc, getDoc, getDocs, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';

// Create user profile
export const createUserProfile = async (userId: string, userData: Partial<User>) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: new Date(),
      role: 'user'
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Create ticket
export const createTicket = async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'tickets'), {
      ...ticketData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { ticketId: docRef.id, error: null };
  } catch (error) {
    return { ticketId: null, error: error.message };
  }
};

// Get user tickets
export const getUserTickets = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'tickets'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const tickets = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { tickets, error: null };
  } catch (error) {
    return { tickets: [], error: error.message };
  }
};
```


## **4. Authentication Components**

### **Onboarding Page Component**

```tsx
// src/components/auth/AuthForm.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { firebaseCreateUser, firebaseSignIn } from '@/lib/auth';
import { createUserProfile } from '@/lib/firestore';

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isSignUp) {
      const { user, error } = await firebaseCreateUser(email, password);
      if (user) {
        await createUserProfile(user.uid, { email, displayName: email });
        // Redirect to dashboard
      } else {
        setError(error);
      }
    } else {
      const { user, error } = await firebaseSignIn(email, password);
      if (user) {
        // Redirect to dashboard
      } else {
        setError(error);
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isSignUp ? 'Create Account' : 'Sign In'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
            required
          />
        </div>
        
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-gray-600 hover:text-gray-800"
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  );
}
```


## **5. Protected Routes \& Middleware**

```typescript
// src/middleware.ts
import type { MiddlewareHandler } from 'astro';
import { auth } from './lib/firebase';

export const onRequest: MiddlewareHandler = async ({ request, redirect }) => {
  // Check if user is authenticated for protected routes
  if (request.url.pathname.startsWith('/dashboard')) {
    const user = auth.currentUser;
    if (!user) {
      return redirect('/onboarding');
    }
  }
};
```


## **6. CRM Dashboard Implementation**

### **Dashboard Layout**

```tsx
// src/components/dashboard/DashboardLayout.tsx
'use client';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { getUserTickets } from '@/lib/firestore';
import { User, LogOut, Plus } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const { tickets } = await getUserTickets(user.uid);
        setTickets(tickets);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">TETRIX Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Open Tickets</h3>
            <p className="text-3xl font-bold text-blue-600">
              {tickets.filter(t => t.status === 'open').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">In Progress</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {tickets.filter(t => t.status === 'in-progress').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Resolved</h3>
            <p className="text-3xl font-bold text-green-600">
              {tickets.filter(t => t.status === 'closed').length}
            </p>
          </div>
        </div>

        {/* New Ticket Button */}
        <div className="mb-6">
          <button className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center space-x-2">
            <Plus size={20} />
            <span>New Ticket</span>
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
```


## **7. Route Specifications**

| Route | Purpose | Layout | Authentication |
| :-- | :-- | :-- | :-- |
| `/` | Landing page with hero, services, partners | MainLayout | Public |
| `/about` | Company info, team, mission | ContentLayout | Public |
| `/solutions` | Product solutions, case studies | ContentLayout | Public |
| `/services` | Service catalog, booking forms | ContentLayout | Public |
| `/contact` | Universal contact hub | ContactLayout | Public |
| `/contact-information-phone` | Phone contact details | ContactLayout | Public |
| `/email` | Email contact options | ContactLayout | Public |
| `/address` | Physical location, map | ContactLayout | Public |
| `/onboarding` | SignUp/SignIn forms | AuthLayout | Public |
| `/dashboard` | CRM dashboard, tickets | DashboardLayout | Protected |

## **8. Implementation Timeline**

**Week 1**: Project setup, Firebase configuration, core layouts
**Week 2**: Authentication system, onboarding flow
**Week 3**: Public pages (home, about, solutions, services)
**Week 4**: Contact hub, dashboard implementation
**Week 5**: Ticket system, testing, optimization, deployment

## **9. Security \& Best Practices**

- **Firestore Security Rules**: Implement rules to restrict user access to their own data[^11]
- **Authentication**: Use Firebase ID tokens for client requests[^11]
- **Data Validation**: Validate all inputs before Firestore operations
- **Error Handling**: Implement comprehensive error handling for all Firebase operations
- **Performance**: Use Firestore queries efficiently with proper indexing[^8]

This comprehensive guide provides your development team with all necessary specifications to build the TETRIX website using Google Firestore instead of Supabase, maintaining the same functionality while leveraging Firebase's ecosystem for authentication and data management.

<div style="text-align: center">⁂</div>

[^1]: Tetrix.txt

[^2]: PRD.md

[^3]: SignUp-Page.md

[^4]: Setup.txt

[^5]: Auth.md

[^6]: https://cloud.google.com/firestore/native/docs/authentication

[^7]: https://docs.astro.build/en/guides/backend/google-firebase/

[^8]: https://firebase.google.com/docs/firestore

[^9]: https://dev.to/arshadayvid/how-i-built-an-event-ticketing-system-with-nextjs-and-firebase-50l2

[^10]: https://github.com/astronomer/ask-astro/blob/main/docs/api/google_firestore.md

[^11]: https://firebase.google.com/docs/firestore/use-rest-api

[^12]: https://www.reddit.com/r/FlutterDev/comments/1axet00/why_anyone_would_choose_firebase_over_supabase/

[^13]: https://www.jakeprins.com/blog/supabase-vs-firebase-2024

[^14]: https://www.reddit.com/r/Firebase/comments/10osnpn/firebase_vs_supabase_vs_both/

[^15]: https://stackoverflow.com/beta/discussions/78581652/supabase-vs-firebase-which-solution-is-better-for-authentication

[^16]: https://docs.astro.build/en/guides/authentication/

[^17]: https://firebase.google.com/docs/auth

[^18]: https://community.vercel.com/t/error-in-deploying-my-astro-react-firebase-authentic-and-firestore-project/1581

[^19]: https://www.reddit.com/r/Firebase/comments/18ohkpj/querying_in_firebase_firestore_should_it_be_done/

[^20]: https://www.reddit.com/r/Supabase/comments/1hkf3k2/migrate_from_firestore_to_supabase/

[^21]: https://stackoverflow.com/questions/77689525/how-to-migrate-sub-collection-of-firestore-to-supabase

[^22]: https://supabase.com/docs/guides/platform/migrating-to-supabase/firestore-data

[^23]: https://supabase.com/alternatives/supabase-vs-firebase

[^24]: https://github.com/orgs/supabase/discussions/175

[^25]: https://supabase.com/docs/guides/platform/migrating-to-supabase/firebase-storage

[^26]: https://invozone.com/blog/firebase-vs-supabase-key-differences-choosing-guide/

[^27]: https://www.launchfa.st/blog/vue-astro-firebase-realtime-database/

[^28]: https://www.launchfa.st/blog/firebase-storage-cloudflare-workers

[^29]: https://supabase.com/docs/guides/platform/migrating-to-supabase/firebase-auth

[^30]: https://supabase.com/docs/guides/auth/third-party/firebase-auth

[^31]: https://docs-pgth9qjfy-supabase.vercel.app/docs/guides/resources/migrating-to-supabase/firebase-storage

[^32]: https://github.com/orgs/supabase/discussions/391

