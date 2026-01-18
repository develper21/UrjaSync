import React from 'react'
import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import Home from '../../../app/page'

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('Home Page', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    
    // Clear localStorage
    localStorage.clear()
  })

  it('renders loading state', () => {
    render(<Home />)
    
    expect(screen.getByText('Loading UrjaSync...')).toBeInTheDocument()
    expect(screen.getByText('⚡')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('redirects to dashboard when access token exists', () => {
    localStorage.setItem('accessToken', 'test-token')
    
    render(<Home />)
    
    // Wait for useEffect to run
    setTimeout(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    }, 0)
  })

  it('redirects to login when no access token exists', () => {
    render(<Home />)
    
    // Wait for useEffect to run
    setTimeout(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    }, 0)
  })

  it('has correct loading spinner styling', () => {
    render(<Home />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('animate-spin')
    expect(spinner).toHaveClass('border-b-2')
    expect(spinner).toHaveClass('border-blue-600')
  })

  it('has correct background gradient', () => {
    render(<Home />)
    
    const container = screen.getByText('Loading UrjaSync...').closest('div')
    expect(container?.parentElement).toHaveClass('bg-gradient-to-br')
    expect(container?.parentElement).toHaveClass('from-blue-50')
    expect(container?.parentElement).toHaveClass('to-indigo-100')
  })
})
