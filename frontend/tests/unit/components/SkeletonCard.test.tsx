import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { SkeletonCard } from 'src/pages/components/grid/SkeletonCard'

describe('SkeletonCard Unit Tests with 10 Iterations', () => {
  Array.from({ length: 10 }).forEach((_, index) => {
    it(`should render skeleton card layout and animation classes correctly for iteration #${index}`, () => {
      const { container } = render(<SkeletonCard />)
      const rootDiv = container.firstChild as HTMLElement

      expect(rootDiv).toBeInTheDocument()
      expect(rootDiv.className).toContain('animate-pulse')
      expect(rootDiv.className).toContain('rounded-xl')
      
      const aspectBox = rootDiv.querySelector('.aspect-video')
      expect(aspectBox).toBeInTheDocument()
    })
  })
})
