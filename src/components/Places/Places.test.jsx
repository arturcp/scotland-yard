import React from 'react'
import { render } from '@testing-library/react'
import Places from './index'

const PLACE_NAMES = [
  'holmes-house', 'museum', 'bar', 'big-bang', 'drugstore',
  'book-store', 'locksmith', 'key', 'bridge', 'docks',
  'park', 'pawnshop', 'theater', 'hotel', 'cigar-shop',
  'graveyard', 'carriage-station', 'bank', 'street', 'scotland-yard',
]

describe('Places', () => {
  test('renders 20 place elements', () => {
    const { container } = render(<Places />)
    expect(container.querySelectorAll('.place')).toHaveLength(20)
  })

  test.each(PLACE_NAMES)('renders the %s place', (name) => {
    const { container } = render(<Places />)
    expect(container.querySelector(`.${name}`)).toBeInTheDocument()
  })
})
