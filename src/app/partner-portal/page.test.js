import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PartnerPortalDashboard from './page';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Partner Portal Dashboard Page', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    mockPush.mockReset();
  });

  it('renders restricted access notice when unauthenticated', async () => {
    render(<PartnerPortalDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
    });

    const loginBtn = screen.getByRole('button', { name: /Authenticate at Partner Login/i });
    expect(loginBtn).toBeInTheDocument();

    fireEvent.click(loginBtn);
    expect(mockPush).toHaveBeenCalledWith('/partner-login');
  });

  it('renders executive portal metrics and partner profile when session exists', async () => {
    const mockSession = JSON.stringify({
      token: 'TK-TEST-123',
      partner: {
        partnerId: 'EAGLE-8821',
        name: 'Strategic Global Capital Group',
        clearanceLevel: 'Level 4 — Tier 1 Investor',
      },
    });

    sessionStorage.setItem('eagle_partner_session', mockSession);

    render(<PartnerPortalDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Partner Executive Portal')).toBeInTheDocument();
    });

    expect(screen.getByText('Strategic Global Capital Group')).toBeInTheDocument();
    expect(screen.getByText('Level 4 — Tier 1 Investor')).toBeInTheDocument();
    expect(screen.getByText('$4.8B')).toBeInTheDocument();
    expect(screen.getByText('12 Assets')).toBeInTheDocument();
    expect(screen.getByText('84.5%')).toBeInTheDocument();
  });

  it('renders strategic briefings and handles briefing download click', async () => {
    const mockSession = JSON.stringify({
      token: 'TK-TEST-123',
      partner: { name: 'Verified Partner' },
    });
    sessionStorage.setItem('eagle_partner_session', mockSession);

    render(<PartnerPortalDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Confidential Strategic Briefings')).toBeInTheDocument();
    });

    expect(screen.getByText('2026 Sovereign Asset & FDI Participation Deck')).toBeInTheDocument();

    const downloadBtns = screen.getAllByRole('button', { name: /Download ↓/i });
    expect(downloadBtns.length).toBeGreaterThan(0);

    fireEvent.click(downloadBtns[0]);

    expect(screen.getByText(/Secure download initiated/i)).toBeInTheDocument();
  });

  it('clears session and redirects to login when Sign Out is clicked', async () => {
    const mockSession = JSON.stringify({
      token: 'TK-TEST-123',
      partner: { name: 'Verified Partner' },
    });
    sessionStorage.setItem('eagle_partner_session', mockSession);

    render(<PartnerPortalDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign Out/i }));

    expect(sessionStorage.getItem('eagle_partner_session')).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/partner-login');
  });
});
