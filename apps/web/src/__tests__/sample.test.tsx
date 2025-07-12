import { render, screen } from '@testing-library/react';
import React from 'react';

describe('Sample Test', () => {
  it('renders hello world', () => {
    render(<div>Hello, world!</div>);
    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
  });
}); 