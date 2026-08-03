import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PrincipalLoginForm from './PrincipalLoginForm';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('PrincipalLoginForm', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    mockPush.mockReset();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders principal ID and security key fields', () => {
    render(<PrincipalLoginForm />);
    expect(screen.getByLabelText(/Principal \/ Sponsor ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Security Key/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Authenticate & Enter Onboarding/i })).toBeInTheDocument();
  });

  it('shows invite notice and pre-fills ID when initialInvite is provided', () => {
    render(<PrincipalLoginForm initialInvite="INV-998877" />);
    expect(screen.getByText(/Valid Invitation Code Detected/i)).toBeInTheDocument();
    expect(screen.getByText('INV-998877')).toBeInTheDocument();
    expect(screen.getByLabelText(/Principal \/ Sponsor ID/i).value).toBe('SPONSOR-998877');
  });

  it('fills demo credentials when demo button is clicked', () => {
    render(<PrincipalLoginForm />);
    fireEvent.click(screen.getByRole('button', { name: /Use Demo Principal Credentials/i }));
    expect(screen.getByLabelText(/Principal \/ Sponsor ID/i).value).toBe('PRINCIPAL-2026');
  });

  it('submits form and redirects to /onboarding on success', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<PrincipalLoginForm />);

    fireEvent.change(screen.getByLabelText(/Principal \/ Sponsor ID/i), { target: { value: 'PRINCIPAL-2026' } });
    fireEvent.change(screen.getByLabelText(/Security Key/i), { target: { value: 'sponsor-key-2026' } });
    fireEvent.click(screen.getByRole('button', { name: /Authenticate & Enter Onboarding/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('shows error message on failed authentication', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials.' }),
    });

    render(<PrincipalLoginForm />);

    fireEvent.change(screen.getByLabelText(/Principal \/ Sponsor ID/i), { target: { value: 'WRONG' } });
    fireEvent.change(screen.getByLabelText(/Security Key/i), { target: { value: 'wrong-key' } });
    fireEvent.click(screen.getByRole('button', { name: /Authenticate & Enter Onboarding/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials.');
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
