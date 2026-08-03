import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PartnerLogin from './page';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Partner Login Page', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    mockPush.mockReset();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the main heading and description', () => {
    render(<PartnerLogin />);
    expect(screen.getByRole('heading', { level: 1, name: /Partner Portal/i })).toBeInTheDocument();
    expect(screen.getByText(/Secure access to global strategic briefings/i)).toBeInTheDocument();
  });

  it('renders form inputs for Partner ID and Security Key', () => {
    render(<PartnerLogin />);
    
    const partnerIdInput = screen.getByLabelText(/Partner ID/i);
    expect(partnerIdInput).toBeInTheDocument();
    expect(partnerIdInput).toHaveAttribute('type', 'text');
    expect(partnerIdInput).toBeRequired();

    const securityKeyInput = screen.getByLabelText(/Security Key/i);
    expect(securityKeyInput).toBeInTheDocument();
    expect(securityKeyInput).toHaveAttribute('type', 'password');
    expect(securityKeyInput).toBeRequired();
  });

  it('populates demo credentials when demo button is clicked', () => {
    render(<PartnerLogin />);

    const demoBtn = screen.getByRole('button', { name: /Use Demo Credentials/i });
    fireEvent.click(demoBtn);

    expect(screen.getByLabelText(/Partner ID/i).value).toBe('EAGLE-8821');
    expect(screen.getByLabelText(/Security Key/i).value).toBe('demo-key-2026');
  });

  it('submits login form and redirects to /partner-portal on success', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        token: 'TK-123456',
        partner: { partnerId: 'EAGLE-8821', name: 'Strategic Global Capital' },
      }),
    });

    render(<PartnerLogin />);

    fireEvent.change(screen.getByLabelText(/Partner ID/i), { target: { value: 'EAGLE-8821' } });
    fireEvent.change(screen.getByLabelText(/Security Key/i), { target: { value: 'demo-key-2026' } });

    fireEvent.click(screen.getByRole('button', { name: /Authenticate/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/partner-portal');
    });
  });

  it('displays an error message when authentication fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid Security Key.' }),
    });

    render(<PartnerLogin />);

    fireEvent.change(screen.getByLabelText(/Partner ID/i), { target: { value: 'BAD-ID' } });
    fireEvent.change(screen.getByLabelText(/Security Key/i), { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: /Authenticate/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid Security Key.')).toBeInTheDocument();
    });
  });
});
