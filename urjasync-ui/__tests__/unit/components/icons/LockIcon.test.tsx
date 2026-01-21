import React from 'react'
import { render, screen } from '@testing-library/react'
import { LockIcon } from '../../../../components/icons/LockIcon'

describe('LockIcon', () => {
  it('renders correctly', () => {
    render(<LockIcon />)
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('fill', 'none')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
  })

  it('applies custom className', () => {
    render(<LockIcon className="custom-class" />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveClass('custom-class')
  })

  it('has correct viewBox', () => {
    render(<LockIcon />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
  })

  it('has correct SVG path', () => {
    render(<LockIcon />)
    const svg = document.querySelector('svg')
    const path = svg?.querySelector('path')
    expect(path).toHaveAttribute('d', 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z')
    expect(path).toHaveAttribute('stroke-width', '2')
  })
})
