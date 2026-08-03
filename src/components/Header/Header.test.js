import { render, screen } from '@testing-library/react';
import Header from './Header';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Header Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ authenticated: false, session: null })
    });
  });
  it('renders the brand name', () => {
    render(<Header />);
    expect(screen.getByText('EAGLE')).toBeInTheDocument();
    expect(screen.getByText('HOLDINGS')).toBeInTheDocument();
  });

  it('renders the navigation buttons', () => {
    render(<Header />);
    expect(screen.getAllByText('Login').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Contact').length).toBeGreaterThan(0);
  });

  it('renders the logo image', () => {
    render(<Header />);
    const logo = screen.getByAltText('Eagle Holdings Logo');
    expect(logo).toBeInTheDocument();
  });
});
