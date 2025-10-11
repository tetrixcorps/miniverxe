import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '../../services/authService'
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset localStorage mock
    vi.mocked(localStorage.getItem).mockReturnValue('{"tokens":{"accessToken":"test-token"}}')
  })

  describe('login', () => {
    it('should login successfully and return 2FA token', async () => {
      const mockResponse = {
        data: {
          message: 'Login successful, 2FA required',
          twoFAToken: 'test-2fa-token',
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser'
          }
        }
      }

      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await authService.login('test@example.com', 'password123')

      expect(result).toEqual(mockResponse.data)
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should handle login errors', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Invalid credentials'
          }
        }
      }

      mockedAxios.post.mockRejectedValue(mockError)

      await expect(authService.login('test@example.com', 'wrongpassword'))
        .rejects.toEqual(mockError)
    })
  })

  describe('verify2FA', () => {
    it('should verify 2FA successfully', async () => {
      const mockResponse = {
        data: {
          message: '2FA verification successful',
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser'
          },
          tokens: {
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token'
          }
        }
      }

      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await authService.verify2FA('test-token', '123456')

      expect(result).toEqual(mockResponse.data)
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/verify-2fa', {
        token: 'test-token',
        code: '123456'
      })
    })

    it('should handle 2FA verification errors', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Invalid 2FA code'
          }
        }
      }

      mockedAxios.post.mockRejectedValue(mockError)

      await expect(authService.verify2FA('test-token', '000000'))
        .rejects.toEqual(mockError)
    })
  })

  describe('register', () => {
    it('should register user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        experienceLevel: 'BEGINNER' as const,
        learningGoals: ['JavaScript']
      }

      const mockResponse = {
        data: {
          message: 'User registered successfully',
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser'
          },
          tokens: {
            accessToken: 'access-token',
            refreshToken: 'refresh-token'
          }
        }
      }

      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await authService.register(userData)

      expect(result).toEqual(mockResponse.data)
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/register', userData)
    })

    it('should handle registration errors', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      }

      const mockError = {
        response: {
          data: {
            message: 'Email already exists'
          }
        }
      }

      mockedAxios.post.mockRejectedValue(mockError)

      await expect(authService.register(userData))
        .rejects.toEqual(mockError)
    })
  })

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      const mockResponse = {
        data: {
          message: 'Tokens refreshed successfully',
          tokens: {
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token'
          }
        }
      }

      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await authService.refreshTokens('refresh-token')

      expect(result).toEqual(mockResponse.data)
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'refresh-token'
      })
    })

    it('should handle refresh token errors', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Invalid refresh token'
          }
        }
      }

      mockedAxios.post.mockRejectedValue(mockError)

      await expect(authService.refreshTokens('invalid-token'))
        .rejects.toEqual(mockError)
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockedAxios.post.mockResolvedValue({ data: {} })

      await authService.logout()

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/logout')
    })

    it('should handle logout errors', async () => {
      const mockError = new Error('Network error')
      mockedAxios.post.mockRejectedValue(mockError)

      await expect(authService.logout())
        .rejects.toEqual(mockError)
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockResponse = {
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User'
          }
        }
      }

      mockedAxios.get.mockResolvedValue(mockResponse)

      const result = await authService.getCurrentUser()

      expect(result).toEqual(mockResponse.data)
      expect(mockedAxios.get).toHaveBeenCalledWith('/auth/me')
    })

    it('should handle get current user errors', async () => {
      const mockError = {
        response: {
          data: {
            message: 'User not found'
          }
        }
      }

      mockedAxios.get.mockRejectedValue(mockError)

      await expect(authService.getCurrentUser())
        .rejects.toEqual(mockError)
    })
  })

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const userData = {
        firstName: 'Updated',
        lastName: 'Name'
      }

      const mockResponse = {
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            firstName: 'Updated',
            lastName: 'Name'
          }
        }
      }

      mockedAxios.put.mockResolvedValue(mockResponse)

      const result = await authService.updateProfile(userData)

      expect(result).toEqual(mockResponse.data)
      expect(mockedAxios.put).toHaveBeenCalledWith('/users/profile', userData)
    })

    it('should handle update profile errors', async () => {
      const userData = {
        firstName: 'Updated'
      }

      const mockError = {
        response: {
          data: {
            message: 'Validation failed'
          }
        }
      }

      mockedAxios.put.mockRejectedValue(mockError)

      await expect(authService.updateProfile(userData))
        .rejects.toEqual(mockError)
    })
  })

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      mockedAxios.put.mockResolvedValue({ data: {} })

      await authService.changePassword('oldpassword', 'newpassword')

      expect(mockedAxios.put).toHaveBeenCalledWith('/users/change-password', {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword'
      })
    })

    it('should handle change password errors', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Current password is incorrect'
          }
        }
      }

      mockedAxios.put.mockRejectedValue(mockError)

      await expect(authService.changePassword('wrongpassword', 'newpassword'))
        .rejects.toEqual(mockError)
    })
  })

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      mockedAxios.delete.mockResolvedValue({ data: {} })

      await authService.deleteAccount()

      expect(mockedAxios.delete).toHaveBeenCalledWith('/users/account')
    })

    it('should handle delete account errors', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Account deletion failed'
          }
        }
      }

      mockedAxios.delete.mockRejectedValue(mockError)

      await expect(authService.deleteAccount())
        .rejects.toEqual(mockError)
    })
  })
})
