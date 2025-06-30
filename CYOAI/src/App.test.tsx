import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />)
    expect(container).toBeDefined()
  })

  it('contains voice AI platform title', () => {
    const { getByText } = render(<App />)
    expect(getByText('Voice AI Platform')).toBeDefined()
  })

  it('contains voice input button', () => {
    const { getByText } = render(<App />)
    expect(getByText('Start Voice Input')).toBeDefined()
  })
})
