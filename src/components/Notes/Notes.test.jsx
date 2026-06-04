import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import Notes from './index'

describe('Notes', () => {
  test('renders the notes modal', () => {
    const { container } = render(<Notes />)
    expect(container.querySelector('#modal-notes')).toBeInTheDocument()
  })

  test('renders the title', () => {
    const { getByText } = render(<Notes />)
    expect(getByText('Notas')).toBeInTheDocument()
  })

  test('renders the textarea', () => {
    const { container } = render(<Notes />)
    expect(container.querySelector('.notes__editor')).toBeInTheDocument()
  })

  test('textarea is empty by default', () => {
    const { container } = render(<Notes />)
    expect(container.querySelector('.notes__editor').value).toBe('')
  })

  test('textarea updates when typed into', () => {
    const { container } = render(<Notes />)
    const textarea = container.querySelector('.notes__editor')
    fireEvent.change(textarea, { target: { value: 'test note' } })
    expect(textarea.value).toBe('test note')
  })

  test('renders save and close buttons', () => {
    const { getByText } = render(<Notes />)
    expect(getByText('Salvar')).toBeInTheDocument()
    expect(getByText('Close')).toBeInTheDocument()
  })
})
