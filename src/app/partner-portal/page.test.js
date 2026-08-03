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
      expect(screen.getByText(/Institutional Partner Access Restricted/i)).toBeInTheDocument();
    });

    const loginBtn = screen.getByRole('button', { name: /Authenticate at Partner Login/i });
    expect(loginBtn).toBeInTheDocument();

    fireEvent.click(loginBtn);
    expect(mockPush).toHaveBeenCalledWith('/login?type=partner');
  });

  it('renders investor relations portal metrics and partner profile when session exists', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({
      authenticated: true,
      session: { sub: 'EAGLE-8821', name: 'Strategic Global Capital Group', clearance: 'Level 4 — Tier 1 Investor' }
    }) });
    render(<PartnerPortalDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Investor Relations & Capital Advisory Dashboard/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Strategic Global Capital Group')).toBeInTheDocument();
    expect(screen.getByText('Level 4 — Tier 1 Investor')).toBeInTheDocument();
    expect(screen.getByText('$4.80 Billion')).toBeInTheDocument();
    expect(screen.getByText('14.20% p.a.')).toBeInTheDocument();
    expect(screen.getByText('$3.10 Billion')).toBeInTheDocument();
  });

  it('renders strategic briefings with deal tags and handles download click', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({
      authenticated: true,
      session: { name: 'Verified Partner', clearance: 'Level 4' }
    }) });
    render(<PartnerPortalDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Featured IR Briefings & Deal Teasers')).toBeInTheDocument();
    });

    expect(screen.getByText('2026 Sovereign Asset & FDI Participation Deck')).toBeInTheDocument();
    expect(screen.getByText(/DEAL-SPONSOR-991/i)).toBeInTheDocument();

    const downloadBtns = screen.getAllByRole('button', { name: /Download ↓/i });
    expect(downloadBtns.length).toBeGreaterThan(0);

    fireEvent.click(downloadBtns[0]);

    expect(screen.getByText(/Decrypted download initialized for IR Document/i)).toBeInTheDocument();
  });

  it('switches to Syndicated Opportunities tab and renders tagged briefing banners', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({
      authenticated: true,
      session: { name: 'Verified Partner', clearance: 'Level 4' }
    }) });
    render(<PartnerPortalDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Investor Relations & Capital Advisory Dashboard/i)).toBeInTheDocument();
    });

    // Switch to Syndicated Opportunities tab
    fireEvent.click(screen.getByRole('button', { name: /💼 Syndicated Opportunities/i }));

    expect(screen.getByRole('heading', { level: 2, name: /Syndicated Co-Investment Mandates/i })).toBeInTheDocument();
    expect(screen.getByText('High-Density Mobility Hub Phase I')).toBeInTheDocument();
    expect(screen.getAllByText(/Tagged Briefing Available:/i).length).toBeGreaterThan(0);
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
