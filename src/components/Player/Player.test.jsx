import React from 'react'
import { render } from '@testing-library/react'
import Player from './index'

const player = { id: 2, name: 'Jane', color: 'yellow', position: { row: 3, column: 5, place: null } }

describe('Player', () => {
  test('renders with the correct id', () => {
    const { container } = render(<Player player={player} style={{}} />)
    expect(container.querySelector('#player-2')).toBeInTheDocument()
  })

  test('applies the player color as a class', () => {
    const { container } = render(<Player player={player} style={{}} />)
    expect(container.querySelector('.player')).toHaveClass('yellow')
  })

  test('renders the user icon', () => {
    const { container } = render(<Player player={player} style={{}} />)
    expect(container.querySelector('.fa-user')).toBeInTheDocument()
  })

  test('applies color to the style prop', () => {
    const style = { top: 10, left: 20 }
    render(<Player player={player} style={style} />)
    expect(style.color).toBe('yellow')
  })
})
