import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login')
  })

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
    await expect(page.getByLabel('Email address')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('should show validation errors for invalid input', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign in' }).click()
    
    // Check for validation errors
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.getByLabel('Email address').fill('invalid@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign in' }).click()
    
    // Check for error message
    await expect(page.getByText('Invalid credentials')).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.getByText('Create an account').click()
    await expect(page).toHaveURL('/register')
  })

  test('should complete registration flow', async ({ page }) => {
    // Navigate to register page
    await page.goto('/register')
    
    // Fill in registration form
    await page.getByLabel('Email address').fill('newuser@example.com')
    await page.getByLabel('Username').fill('newuser')
    await page.getByLabel('Password').fill('password123')
    await page.getByLabel('First name').fill('New')
    await page.getByLabel('Last name').fill('User')
    
    // Submit form
    await page.getByRole('button', { name: 'Create account' }).click()
    
    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Welcome, New User')).toBeVisible()
  })

  test('should complete login flow with 2FA', async ({ page }) => {
    // Mock successful login response
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Login successful, 2FA required',
          twoFAToken: 'test-2fa-token',
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser'
          }
        })
      })
    })

    // Mock 2FA verification response
    await page.route('**/api/auth/verify-2fa', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: '2FA verification successful',
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User'
          },
          tokens: {
            accessToken: 'access-token',
            refreshToken: 'refresh-token'
          }
        })
      })
    })

    // Fill in login form
    await page.getByLabel('Email address').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    
    // Should show 2FA form
    await expect(page.getByText('Enter 2FA Code')).toBeVisible()
    await expect(page.getByLabel('2FA Code')).toBeVisible()
    
    // Enter 2FA code
    await page.getByLabel('2FA Code').fill('123456')
    await page.getByRole('button', { name: 'Verify' }).click()
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Welcome, Test User')).toBeVisible()
  })

  test('should handle 2FA verification error', async ({ page }) => {
    // Mock login response
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Login successful, 2FA required',
          twoFAToken: 'test-2fa-token',
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser'
          }
        })
      })
    })

    // Mock 2FA verification error
    await page.route('**/api/auth/verify-2fa', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: '2FA verification failed',
          message: 'Invalid 2FA code'
        })
      })
    })

    // Complete login
    await page.getByLabel('Email address').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    
    // Enter invalid 2FA code
    await page.getByLabel('2FA Code').fill('000000')
    await page.getByRole('button', { name: 'Verify' }).click()
    
    // Should show error message
    await expect(page.getByText('Invalid 2FA code')).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('auth-storage', JSON.stringify({
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User'
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token'
        },
        isAuthenticated: true
      }))
    })

    // Navigate to dashboard
    await page.goto('/dashboard')
    
    // Click logout button
    await page.getByText('Logout').click()
    
    // Should redirect to login page
    await expect(page).toHaveURL('/login')
    await expect(page.getByText('Sign In')).toBeVisible()
  })

  test('should redirect to login when accessing protected route without authentication', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard')
    
    // Should redirect to login page
    await expect(page).toHaveURL('/login')
  })

  test('should redirect to profile setup when user has no profile', async ({ page }) => {
    // Mock user without profile
    await page.addInitScript(() => {
      localStorage.setItem('auth-storage', JSON.stringify({
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          profile: null
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token'
        },
        isAuthenticated: true
      }))
    })

    // Navigate to dashboard
    await page.goto('/dashboard')
    
    // Should redirect to profile setup
    await expect(page).toHaveURL('/profile/setup')
  })
})
