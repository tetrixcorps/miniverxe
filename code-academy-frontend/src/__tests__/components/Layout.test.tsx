import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Layout from '../../components/Layout'

// Mock the auth store
const mockAuthStore = {
  user: {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    profile: {
      bio: 'Test bio',
      experienceLevel: 'BEGINNER',
      learningGoals: ['JavaScript'],
      skills: [],
      timezone: 'UTC',
      language: 'en'
    }
  },
  isAuthenticated: true,
  isLoading: false,
  logout: vi.fn()
}

vi.mock('../../store/authStore', () => ({
  useAuthStore: () => mockAuthStore
}))

// Mock the token refresh functions
vi.mock('../../store/authStore', async () => {
  const actual = await vi.importActual('../../store/authStore')
  return {
    ...actual,
    startTokenRefresh: vi.fn(),
    stopTokenRefresh: vi.fn()
  }
})

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Layout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders layout with navigation', () => {
    renderWithRouter(<Layout><div>Test Content</div></Layout>)
    
    expect(screen.getByText('TETRIX')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Courses')).toBeInTheDocument()
    expect(screen.getByText('Collaboration')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('displays user information', () => {
    renderWithRouter(<Layout><div>Test Content</div></Layout>)
    
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('@testuser')).toBeInTheDocument()
  })

  it('opens mobile menu when menu button is clicked', () => {
    renderWithRouter(<Layout><div>Test Content</div></Layout>)
    
    const menuButton = screen.getByLabelText('Open menu')
    fireEvent.click(menuButton)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes mobile menu when close button is clicked', () => {
    renderWithRouter(<Layout><div>Test Content</div></Layout>)
    
    const menuButton = screen.getByLabelText('Open menu')
    fireEvent.click(menuButton)
    
    const closeButton = screen.getByTestId('x-icon')
    fireEvent.click(closeButton)
    
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('calls logout when logout button is clicked', () => {
    renderWithRouter(<Layout><div>Test Content</div></Layout>)
    
    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)
    
    expect(mockAuthStore.logout).toHaveBeenCalledTimes(1)
  })

  it('shows search input', () => {
    renderWithRouter(<Layout><div>Test Content</div></Layout>)
    
    const searchInput = screen.getByPlaceholderText('Search courses, lessons...')
    expect(searchInput).toBeInTheDocument()
  })

  it('shows notification and message buttons', () => {
    renderWithRouter(<Layout><div>Test Content</div></Layout>)
    
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument()
    expect(screen.getByTestId('message-circle-icon')).toBeInTheDocument()
  })

  it('shows progress indicator', () => {
    renderWithRouter(<Layout><div>Test Content</div></Layout>)
    
    expect(screen.getByText('Level 5')).toBeInTheDocument()
    expect(screen.getByTestId('trophy-icon')).toBeInTheDocument()
  })

  it('handles navigation link clicks', () => {
    renderWithRouter(<Layout><div>Test Content</div></Layout>)
    
    const dashboardLink = screen.getByText('Dashboard')
    expect(dashboardLink).toHaveAttribute('href', '/dashboard')
    
    const coursesLink = screen.getByText('Courses')
    expect(coursesLink).toHaveAttribute('href', '/courses')
  })

  it('closes mobile menu when navigation link is clicked', () => {
    renderWithRouter(<Layout><div>Test Content</div></Layout>)
    
    const menuButton = screen.getByLabelText('Open menu')
    fireEvent.click(menuButton)
    
    const dashboardLink = screen.getByText('Dashboard')
    fireEvent.click(dashboardLink)
    
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('handles outside click to close mobile menu', () => {
    renderWithRouter(<Layout><div>Test Content</div></Layout>)
    
    const menuButton = screen.getByLabelText('Open menu')
    fireEvent.click(menuButton)
    
    // Click outside the menu
    fireEvent.click(document.body)
    
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('renders with different user data', () => {
    const differentUser = {
      ...mockAuthStore.user,
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe'
    }
    
    vi.mocked(useAuthStore).mockReturnValue({
      ...mockAuthStore,
      user: differentUser
    })
    
    renderWithRouter(<Layout><div>Test Content</div></Layout>)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('@johndoe')).toBeInTheDocument()
  })

  it('handles user without profile data', () => {
    const userWithoutProfile = {
      ...mockAuthStore.user,
      profile: undefined
    }
    
    vi.mocked(useAuthStore).mockReturnValue({
      ...mockAuthStore,
      user: userWithoutProfile
    })
    
    renderWithRouter(<Layout><div>Test Content</div></Layout>)
    
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('@testuser')).toBeInTheDocument()
  })

  it('handles user without first and last name', () => {
    const userWithoutNames = {
      ...mockAuthStore.user,
      firstName: undefined,
      lastName: undefined
    }
    
    vi.mocked(useAuthStore).mockReturnValue({
      ...mockAuthStore,
      user: userWithoutNames
    })
    
    renderWithRouter(<Layout><div>Test Content</div></Layout>)
    
    expect(screen.getByText('@testuser')).toBeInTheDocument()
  })
})
