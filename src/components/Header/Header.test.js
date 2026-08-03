import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header Component', () => {
  it('renders the brand name', () => {
    render(<Header />);
    expect(screen.getByText('EAGLE')).toBeInTheDocument();
    expect(screen.getByText('HOLDINGS')).toBeInTheDocument();
  });

  it('renders the navigation buttons', () => {
    render(<Header />);
    expect(screen.getAllByText('Partner Login').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Onboarding').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Contact').length).toBeGreaterThan(0);
  });

  it('renders the logo image', () => {
    render(<Header />);
    const logo = screen.getByAltText('Eagle Holdings Logo');
    expect(logo).toBeInTheDocument();
  });
});
