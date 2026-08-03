import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PartnerLoginForm from './PartnerLoginForm';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('PartnerLoginForm', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    mockPush.mockReset();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders partner ID and security key fields', () => {
    render(<PartnerLoginForm />);
    expect(screen.getByLabelText(/Partner ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Security Key/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Authenticate/i })).toBeInTheDocument();
  });

  it('fills demo credentials when demo button is clicked', () => {
    render(<PartnerLoginForm />);
    fireEvent.click(screen.getByRole('button', { name: /Use Demo Credentials/i }));
    expect(screen.getByLabelText(/Partner ID/i).value).toBe('EAGLE-8821');
  });

  it('submits form and redirects to /partner-portal on success', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<PartnerLoginForm />);

    fireEvent.change(screen.getByLabelText(/Partner ID/i), { target: { value: 'EAGLE-8821' } });
    fireEvent.change(screen.getByLabelText(/Security Key/i), { target: { value: 'demo-key-2026' } });
    fireEvent.click(screen.getByRole('button', { name: /Authenticate/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/partner-portal');
    });
  });

  it('shows error message on failed authentication', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials.' }),
    });

    render(<PartnerLoginForm />);

    fireEvent.change(screen.getByLabelText(/Partner ID/i), { target: { value: 'WRONG' } });
    fireEvent.change(screen.getByLabelText(/Security Key/i), { target: { value: 'wrong-key' } });
    fireEvent.click(screen.getByRole('button', { name: /Authenticate/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials.');
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
