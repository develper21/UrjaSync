import { NextRequest } from 'next/server'
import { POST } from '../../../../../app/api/auth/login/route'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import bcrypt from 'bcryptjs'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve([])),
        })),
      })),
    })),
  },
}))

jest.mock('bcryptjs')

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 400 for invalid email format', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error.message).toBe('Invalid email format')
  })

  it('should return 400 for missing password', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: '',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error.message).toBe('Password is required')
  })

  it('should return 401 for non-existent user', async () => {
    const mockSelect = jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve([])),
        })),
      })),
    }))
    
    ;(db.select as jest.Mock).mockImplementation(mockSelect)

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error.message).toBe('Invalid email or password')
  })

  it('should return 401 for invalid password', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedpassword',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      isEmailVerified: true,
      avatar: null,
    }

    const mockSelect = jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve([mockUser])),
        })),
      })),
    }))
    
    ;(db.select as jest.Mock).mockImplementation(mockSelect)
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error.message).toBe('Invalid email or password')
    expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword')
  })

  it('should return 200 for successful login', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedpassword',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      isEmailVerified: true,
      avatar: null,
    }

    const mockSelect = jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve([mockUser])),
        })),
      })),
    }))
    
    ;(db.select as jest.Mock).mockImplementation(mockSelect)
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

    // Mock AuthService
    jest.mock('@/lib/services/authService', () => ({
      AuthService: {
        generateAccessToken: jest.fn(() => 'mock-access-token'),
        createRefreshToken: jest.fn(() => Promise.resolve('mock-refresh-token')),
      },
    }))

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('Login successful')
    expect(data.data.user.email).toBe('test@example.com')
    expect(data.data.tokens.accessToken).toBe('mock-access-token')
    expect(data.data.tokens.refreshToken).toBe('mock-refresh-token')
  })

  it('should return 500 for database errors', async () => {
    const mockSelect = jest.fn(() => {
      throw new Error('Database connection failed')
    })
    
    ;(db.select as jest.Mock).mockImplementation(mockSelect)

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error.message).toBe('Internal server error')
  })
})
