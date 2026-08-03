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
    global.fetch = jest.fn();
    mockPush.mockReset();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders restricted access notice when unauthenticated', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ authenticated: false, session: null }) });
    render(<PartnerPortalDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
    });

    const loginBtn = screen.getByRole('button', { name: /Authenticate at Partner Login/i });
    expect(loginBtn).toBeInTheDocument();

    fireEvent.click(loginBtn);
    expect(mockPush).toHaveBeenCalledWith('/login?type=partner');
  });

  it('renders executive portal metrics and partner profile when session exists', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({
      authenticated: true,
      session: { sub: 'EAGLE-8821', name: 'Strategic Global Capital Group', clearance: 'Level 4 — Tier 1 Investor' }
    }) });
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
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({
      authenticated: true,
      session: { name: 'Verified Partner', clearance: 'Level 4' }
    }) });
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

  it('calls logout API and redirects to login when Sign Out is clicked', async () => {
    global.fetch.mockImplementation(async (url) => {
      if (url === '/api/auth/session') return { ok: true, json: async () => ({ authenticated: true, session: { name: 'Verified Partner', clearance: 'Level 4' } }) };
      if (url === '/api/auth/logout') return { ok: true, json: async () => ({ success: true }) };
      return { ok: true, json: async () => ({}) };
    });

    render(<PartnerPortalDashboard />);
    await screen.findByText('Sign Out');

    await waitFor(() => {
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign Out/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login?type=partner');
    });
  });
});
