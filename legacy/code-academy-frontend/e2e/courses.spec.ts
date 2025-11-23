import { test, expect } from '@playwright/test'

test.describe('Course Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('auth-storage', JSON.stringify({
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
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token'
        },
        isAuthenticated: true
      }))
    })

    // Mock API responses
    await page.route('**/api/courses**', async route => {
      const url = new URL(route.request().url())
      
      if (route.request().method() === 'GET') {
        if (url.pathname.endsWith('/courses')) {
          // List courses
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              courses: [
                {
                  id: '1',
                  title: 'JavaScript Fundamentals',
                  description: 'Learn the basics of JavaScript programming',
                  difficulty: 'BEGINNER',
                  duration: 120,
                  price: 0,
                  isFree: true,
                  isPublished: true,
                  thumbnail: 'https://example.com/js-thumb.jpg',
                  _count: {
                    enrollments: 150,
                    lessons: 10,
                    reviews: 25
                  }
                },
                {
                  id: '2',
                  title: 'React Advanced',
                  description: 'Advanced React concepts and patterns',
                  difficulty: 'ADVANCED',
                  duration: 180,
                  price: 99,
                  isFree: false,
                  isPublished: true,
                  thumbnail: 'https://example.com/react-thumb.jpg',
                  _count: {
                    enrollments: 75,
                    lessons: 15,
                    reviews: 12
                  }
                }
              ],
              pagination: {
                page: 1,
                limit: 10,
                total: 2,
                totalPages: 1,
                hasNext: false,
                hasPrev: false
              }
            })
          })
        } else {
          // Get specific course
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              course: {
                id: '1',
                title: 'JavaScript Fundamentals',
                description: 'Learn the basics of JavaScript programming',
                difficulty: 'BEGINNER',
                duration: 120,
                price: 0,
                isFree: true,
                isPublished: true,
                thumbnail: 'https://example.com/js-thumb.jpg',
                lessons: [
                  {
                    id: '1',
                    title: 'Introduction to JavaScript',
                    order: 1,
                    _count: {
                      exercises: 5
                    }
                  },
                  {
                    id: '2',
                    title: 'Variables and Data Types',
                    order: 2,
                    _count: {
                      exercises: 8
                    }
                  }
                ],
                _count: {
                  enrollments: 150,
                  lessons: 10,
                  reviews: 25
                }
              }
            })
          })
        }
      }
    })
  })

  test('should display courses list', async ({ page }) => {
    await page.goto('/courses')
    
    // Check page title
    await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible()
    
    // Check course cards
    await expect(page.getByText('JavaScript Fundamentals')).toBeVisible()
    await expect(page.getByText('React Advanced')).toBeVisible()
    
    // Check course details
    await expect(page.getByText('Learn the basics of JavaScript programming')).toBeVisible()
    await expect(page.getByText('Advanced React concepts and patterns')).toBeVisible()
    
    // Check difficulty badges
    await expect(page.getByText('BEGINNER')).toBeVisible()
    await expect(page.getByText('ADVANCED')).toBeVisible()
    
    // Check pricing
    await expect(page.getByText('Free')).toBeVisible()
    await expect(page.getByText('$99')).toBeVisible()
  })

  test('should filter courses by difficulty', async ({ page }) => {
    await page.goto('/courses')
    
    // Click on difficulty filter
    await page.getByRole('button', { name: 'Difficulty' }).click()
    await page.getByText('Beginner').click()
    
    // Should show only beginner courses
    await expect(page.getByText('JavaScript Fundamentals')).toBeVisible()
    await expect(page.getByText('React Advanced')).not.toBeVisible()
  })

  test('should search courses', async ({ page }) => {
    await page.goto('/courses')
    
    // Search for JavaScript
    await page.getByPlaceholder('Search courses...').fill('JavaScript')
    await page.keyboard.press('Enter')
    
    // Should show only JavaScript course
    await expect(page.getByText('JavaScript Fundamentals')).toBeVisible()
    await expect(page.getByText('React Advanced')).not.toBeVisible()
  })

  test('should view course details', async ({ page }) => {
    await page.goto('/courses')
    
    // Click on first course
    await page.getByText('JavaScript Fundamentals').click()
    
    // Should navigate to course detail page
    await expect(page).toHaveURL('/courses/1')
    
    // Check course details
    await expect(page.getByRole('heading', { name: 'JavaScript Fundamentals' })).toBeVisible()
    await expect(page.getByText('Learn the basics of JavaScript programming')).toBeVisible()
    
    // Check lessons
    await expect(page.getByText('Introduction to JavaScript')).toBeVisible()
    await expect(page.getByText('Variables and Data Types')).toBeVisible()
    
    // Check enrollment button
    await expect(page.getByRole('button', { name: 'Enroll Now' })).toBeVisible()
  })

  test('should enroll in course', async ({ page }) => {
    // Mock enrollment API
    await page.route('**/api/courses/1/enroll', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Successfully enrolled in course',
          enrollment: {
            id: '1',
            userId: '1',
            courseId: '1',
            enrolledAt: new Date().toISOString()
          }
        })
      })
    })

    await page.goto('/courses/1')
    
    // Click enroll button
    await page.getByRole('button', { name: 'Enroll Now' }).click()
    
    // Should show success message
    await expect(page.getByText('Successfully enrolled in course')).toBeVisible()
    
    // Button should change to "Go to Course"
    await expect(page.getByRole('button', { name: 'Go to Course' })).toBeVisible()
  })

  test('should handle enrollment error', async ({ page }) => {
    // Mock enrollment error
    await page.route('**/api/courses/1/enroll', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Enrollment failed',
          message: 'You are already enrolled in this course'
        })
      })
    })

    await page.goto('/courses/1')
    
    // Click enroll button
    await page.getByRole('button', { name: 'Enroll Now' }).click()
    
    // Should show error message
    await expect(page.getByText('You are already enrolled in this course')).toBeVisible()
  })

  test('should display course progress', async ({ page }) => {
    // Mock user progress
    await page.route('**/api/courses/1/progress', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          progress: {
            courseId: '1',
            userId: '1',
            completedLessons: 5,
            totalLessons: 10,
            completedExercises: 25,
            totalExercises: 50,
            progressPercentage: 50,
            lastAccessedAt: new Date().toISOString()
          }
        })
      })
    })

    await page.goto('/courses/1')
    
    // Check progress bar
    await expect(page.getByText('50% Complete')).toBeVisible()
    await expect(page.getByText('5 of 10 lessons completed')).toBeVisible()
  })

  test('should navigate to lesson', async ({ page }) => {
    await page.goto('/courses/1')
    
    // Click on first lesson
    await page.getByText('Introduction to JavaScript').click()
    
    // Should navigate to lesson page
    await expect(page).toHaveURL('/courses/1/lessons/1')
  })

  test('should handle course not found', async ({ page }) => {
    // Mock 404 response
    await page.route('**/api/courses/999', async route => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Course not found',
          message: 'The requested course does not exist'
        })
      })
    })

    await page.goto('/courses/999')
    
    // Should show 404 message
    await expect(page.getByText('Course not found')).toBeVisible()
    await expect(page.getByText('The requested course does not exist')).toBeVisible()
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/courses**', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal server error',
          message: 'Something went wrong'
        })
      })
    })

    await page.goto('/courses')
    
    // Should show error message
    await expect(page.getByText('Something went wrong')).toBeVisible()
  })
})
