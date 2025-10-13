import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import ProtectedRoute from '../../components/ProtectedRoute'

// Mock the auth store
const mockAuthStore = {
  isAuthenticated: false,
  isLoading: false,
  user: null
}

vi.mock('../../store/authStore', () => ({
  useAuthStore: () => mockAuthStore
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state when authentication is loading', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      ...mockAuthStore,
      isLoading: true
    })

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('TETRIX Code Academy')).toBeInTheDocument()
    expect(screen.getByText('Verifying your access...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects to login when not authenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      ...mockAuthStore,
      isAuthenticated: false,
      isLoading: false
    })

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login')
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when authenticated and user has profile', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      ...mockAuthStore,
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        profile: {
          bio: 'Test bio',
          experienceLevel: 'BEGINNER',
          learningGoals: ['JavaScript'],
          skills: [],
          timezone: 'UTC',
          language: 'en'
        }
      }
    })

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
  })

  it('redirects to profile setup when user has no profile', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      ...mockAuthStore,
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        profile: null
      }
    })

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/profile/setup')
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects to profile setup when user profile is undefined', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      ...mockAuthStore,
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        email: 'test@example.com',
        username: 'testuser'
        // profile is undefined
      }
    })

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/profile/setup')
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('handles user without id', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      ...mockAuthStore,
      isAuthenticated: true,
      isLoading: false,
      user: {
        email: 'test@example.com',
        username: 'testuser',
        profile: {
          bio: 'Test bio',
          experienceLevel: 'BEGINNER',
          learningGoals: ['JavaScript'],
          skills: [],
          timezone: 'UTC',
          language: 'en'
        }
      }
    })

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
