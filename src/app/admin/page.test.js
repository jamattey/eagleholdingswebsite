import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminPortalPage from './page';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('Executive Admin Portal Page', () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders access denied message when unauthenticated or non-admin', async () => {
    global.fetch = jest.fn().mockImplementation(async (url) => {
      if (url === '/api/auth/session') {
        return { ok: true, json: async () => ({ authenticated: false, session: null }) };
      }
      return { ok: true, json: async () => ({}) };
    });

    render(<AdminPortalPage />);

    await waitFor(() => {
      expect(screen.getByText(/Executive Admin Access Required/i)).toBeInTheDocument();
    });

    const loginBtn = screen.getByRole('button', { name: /Authenticate as Executive Admin/i });
    expect(loginBtn).toBeInTheDocument();
    fireEvent.click(loginBtn);
    expect(mockPush).toHaveBeenCalledWith('/login?type=admin');
  });

  it('renders Executive Command Center dashboard when authenticated as ADMIN', async () => {
    global.fetch = jest.fn().mockImplementation(async (url) => {
      if (url === '/api/auth/session') {
        return { ok: true, json: async () => ({ authenticated: true, session: { role: 'ADMIN', name: 'Executive Advisor' } }) };
      }
      return { ok: true, json: async () => ({}) };
    });

    render(<AdminPortalPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Executive Admin Command Center/i })).toBeInTheDocument();
    });

    expect(screen.getByText('$525,000,000 USD')).toBeInTheDocument();
    expect(screen.getByText('📊 Executive Overview')).toBeInTheDocument();
    expect(screen.getByText('📄 Partner Briefings Upload')).toBeInTheDocument();
  });

  it('switches between command tabs', async () => {
    global.fetch = jest.fn().mockImplementation(async (url) => {
      if (url === '/api/auth/session') {
        return { ok: true, json: async () => ({ authenticated: true, session: { role: 'ADMIN', name: 'Executive Advisor' } }) };
      }
      return { ok: true, json: async () => ({}) };
    });

    render(<AdminPortalPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Executive Admin Command Center/i })).toBeInTheDocument();
    });

    // Switch to Partner Briefings Upload tab
    fireEvent.click(screen.getByRole('button', { name: /📄 Partner Briefings Upload/i }));
    expect(screen.getByRole('heading', { level: 2, name: /Partner Briefing Manager/i })).toBeInTheDocument();

    // Switch to Partner Invitations tab
    fireEvent.click(screen.getByRole('button', { name: /✉️ Partner Invitations/i }));
    expect(screen.getByRole('heading', { level: 2, name: /Partner & Sponsor Invitation Manager/i })).toBeInTheDocument();

    // Switch to OWASP Audit Stream tab
    fireEvent.click(screen.getByRole('button', { name: /🛡️ OWASP Audit Stream/i }));
    expect(screen.getByRole('heading', { level: 2, name: /OWASP Security Audit & Event Stream/i })).toBeInTheDocument();
  });

  it('allows Admin to upload a new Partner Briefing for the Partner Portal', async () => {
    global.fetch = jest.fn().mockImplementation(async (url, options) => {
      if (url === '/api/auth/session') {
        return { ok: true, json: async () => ({ authenticated: true, session: { role: 'ADMIN', name: 'Executive Advisor' } }) };
      }
      if (url === '/api/admin') {
        const body = JSON.parse(options.body);
        if (body.action === 'upload_partner_briefing') {
          return {
            ok: true,
            json: async () => ({
              success: true,
              briefing: {
                id: 'brf-999',
                ref: 'BRF-TEST',
                title: body.briefingTitle,
                category: body.briefingCategory,
                fileName: body.briefingFileName,
                uploadedAt: '2026-08-03',
                status: 'Published to Partner Portal',
              },
            }),
          };
        }
      }
      return { ok: true, json: async () => ({}) };
    });

    render(<AdminPortalPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Executive Admin Command Center/i })).toBeInTheDocument();
    });

    // Navigate to Briefings Tab
    fireEvent.click(screen.getByRole('button', { name: /📄 Partner Briefings Upload/i }));

    fireEvent.change(screen.getByLabelText(/Briefing Title \*/i), { target: { value: 'Q4 Institutional Yield Strategy' } });
    fireEvent.change(screen.getByLabelText(/File Name \/ Document Name \*/i), { target: { value: 'Q4_Yield_Strategy.pdf' } });

    fireEvent.click(screen.getByRole('button', { name: /Publish Briefing to Partner Portal →/i }));

    await waitFor(() => {
      expect(screen.getByText(/uploaded and published to Partner Portal/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Q4 Institutional Yield Strategy')).toBeInTheDocument();
  });
});
