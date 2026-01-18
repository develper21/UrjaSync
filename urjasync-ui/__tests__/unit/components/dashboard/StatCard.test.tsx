import React from 'react'
import { render, screen } from '@testing-library/react'
import StatCard from '../../../../components/dashboard/StatCard'

describe('StatCard', () => {
  const mockIcon = <svg data-testid="test-icon" />

  it('renders title and value correctly', () => {
    render(<StatCard title="Test Title" value="100" icon={mockIcon} />)
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('renders icon with correct styling', () => {
    render(<StatCard title="Test Title" value="100" icon={mockIcon} />)
    
    const icon = screen.getByTestId('test-icon')
    expect(icon).toHaveClass('w-6', 'h-6')
  })

  it('has correct container styling', () => {
    render(<StatCard title="Test Title" value="100" icon={mockIcon} />)
    
    const container = screen.getByText('Test Title').closest('div').parentElement
    expect(container).toHaveClass('bg-white', 'p-6', 'rounded-xl', 'shadow-lg')
  })

  it('applies hover effects', () => {
    render(<StatCard title="Test Title" value="100" icon={mockIcon} />)
    
    const container = screen.getByText('Test Title').closest('div').parentElement
    expect(container).toHaveClass('transition-all', 'hover:shadow-xl', 'hover:scale-105')
  })

  it('wraps icon in gray background', () => {
    render(<StatCard title="Test Title" value="100" icon={mockIcon} />)
    
    const iconContainer = screen.getByTestId('test-icon').parentElement
    expect(iconContainer).toHaveClass('p-3', 'bg-gray-100', 'rounded-full')
  })

  it('has correct text styling', () => {
    render(<StatCard title="Test Title" value="100" icon={mockIcon} />)
    
    const title = screen.getByText('Test Title')
    const value = screen.getByText('100')
    
    expect(title).toHaveClass('text-sm', 'font-medium', 'text-gray-500')
    expect(value).toHaveClass('text-2xl', 'font-semibold', 'text-gray-800')
  })
})
