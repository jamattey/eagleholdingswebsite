import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PrincipalLoginPage from './page';

const mockPush = jest.fn();
let mockInviteParam = null;

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key) => (key === 'invite' ? mockInviteParam : null),
  }),
}));

describe('Project Principal Login Page', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    mockPush.mockReset();
    mockInviteParam = null;
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders page heading and handles invitation code notice if present', () => {
    mockInviteParam = 'INV-883921';
    render(<PrincipalLoginPage />);
    expect(screen.getByRole('heading', { level: 1, name: /Project Principal Access/i })).toBeInTheDocument();
    expect(screen.getByText(/INV-883921/i)).toBeInTheDocument();
  });

  it('populates demo credentials when demo button is clicked', () => {
    mockInviteParam = null;
    render(<PrincipalLoginPage />);

    const demoBtn = screen.getByRole('button', { name: /Use Demo Principal Credentials/i });
    fireEvent.click(demoBtn);

    expect(screen.getByLabelText(/Principal \/ Sponsor ID/i).value).toBe('PRINCIPAL-2026');
    expect(screen.getByLabelText(/Security Key/i).value).toBe('sponsor-key-2026');
  });

  it('submits form and redirects to /onboarding on successful authentication', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        token: 'SPON-998877',
        principal: { principalId: 'PRINCIPAL-2026', name: 'Metro Infrastructure' },
      }),
    });

    render(<PrincipalLoginPage />);

    fireEvent.change(screen.getByLabelText(/Principal \/ Sponsor ID/i), { target: { value: 'PRINCIPAL-2026' } });
    fireEvent.change(screen.getByLabelText(/Security Key/i), { target: { value: 'sponsor-key-2026' } });

    fireEvent.click(screen.getByRole('button', { name: /Authenticate & Enter Onboarding/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/onboarding');
    });

    expect(sessionStorage.getItem('eagle_principal_session')).not.toBeNull();
  });

  it('displays error message when authentication fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid Security Key.' }),
    });

    render(<PrincipalLoginPage />);

    fireEvent.change(screen.getByLabelText(/Principal \/ Sponsor ID/i), { target: { value: 'BAD-ID' } });
    fireEvent.change(screen.getByLabelText(/Security Key/i), { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: /Authenticate & Enter Onboarding/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid Security Key.')).toBeInTheDocument();
    });
  });
});
