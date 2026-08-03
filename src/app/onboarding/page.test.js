import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OnboardingPage from './page';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Onboarding Portal Page', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    mockPush.mockReset();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders page header and compliance progress meter', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ authenticated: false, session: null }) });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ authenticated: false, session: null }),
    });

    render(<OnboardingPage />);
    expect(screen.getByRole('heading', { level: 1, name: /Project Onboarding & Intake Portal/i })).toBeInTheDocument();
    expect(screen.getByText(/Overall Project Compliance Clearance Status/i)).toBeInTheDocument();
  });

  it('displays lock overlay and blur prompt when unauthenticated in Principal view', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ authenticated: false, session: null }) });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ authenticated: false, session: null }),
    });

    render(<OnboardingPage />);
    
    // Switch to Virtual Data Room tab to see the overlay
    fireEvent.click(screen.getByRole('button', { name: /Virtual Data Room/i }));

    expect(screen.getByText(/Authentication Required to Access Data Room/i)).toBeInTheDocument();

    const unlockBtn = screen.getByRole('button', { name: /Authenticate to Access Principal Workspace/i });
    expect(unlockBtn).toBeInTheDocument();

    fireEvent.click(unlockBtn);
    expect(mockPush).toHaveBeenCalledWith('/login?type=principal');
  });

  it('removes blur overlay when authenticated session is present', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ authenticated: true, session: { sub: 'SPON-123', name: 'Metro Infra', role: 'PRINCIPAL' } }) });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        authenticated: true,
        session: { sub: 'SPON-123', name: 'Metro Infra', role: 'PRINCIPAL' },
      }),
    });

    render(<OnboardingPage />);

    // Switch to Virtual Data Room tab to check if overlay is removed
    fireEvent.click(screen.getByRole('button', { name: /Virtual Data Room/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Authentication Required to Access Data Room/i)).not.toBeInTheDocument();
    });
  });

  it('renders compliance items for KYC, UBO, CIS, Architectural, MEP, Soil, and Permits', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ authenticated: false, session: null }) });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ authenticated: false, session: null }),
    });

    render(<OnboardingPage />);
    
    // Switch to Virtual Data Room tab where checklist items are displayed
    fireEvent.click(screen.getByRole('button', { name: /Virtual Data Room/i }));

    expect(screen.getByText('Personal KYC & Passport Verification')).toBeInTheDocument();
    expect(screen.getByText('Ultimate Beneficial Owner (UBO) Disclosures')).toBeInTheDocument();
    expect(screen.getByText('Corporate Banking Credentials & CIS')).toBeInTheDocument();
    
    // Updated compliance items according to new 11 items list
    expect(screen.getByText('Feasibility Studies')).toBeInTheDocument();
    expect(screen.getByText('Geotech Report')).toBeInTheDocument();
    expect(screen.getByText('Soil Test')).toBeInTheDocument();
    expect(screen.getByText('Structural Design')).toBeInTheDocument();
    expect(screen.getByText('Full Plans with Quantities')).toBeInTheDocument();
    expect(screen.getByText('Electrical Designs')).toBeInTheDocument();
    expect(screen.getByText('Sewage and Trash Disposal')).toBeInTheDocument();
    expect(screen.getByText('Permits')).toBeInTheDocument();
    expect(screen.getByText('Licenses')).toBeInTheDocument();
    expect(screen.getByText('Civil Design')).toBeInTheDocument();
    expect(screen.getByText('Environmental & Social Impact Assessment (ESIA)')).toBeInTheDocument();
  });

  it('switches between Principal View and Admin View', async () => {
    global.fetch.mockImplementation(async (url) => {
      if (url === '/api/auth/session') return { ok: true, json: async () => ({ authenticated: true, session: { role: 'ADMIN' } }) };
      return { ok: true, json: async () => ({}) };
    });

    render(<OnboardingPage />);
    
    // Wait for session to load
    await screen.findByRole('button', { name: /Admin View \(Backend\)/i });

    const adminRoleBtn = screen.getByRole('button', { name: /Admin View \(Backend\)/i });
    fireEvent.click(adminRoleBtn);

    expect(screen.getByRole('heading', { level: 1, name: /Deal Audit & Command Portal/i })).toBeInTheDocument();
    expect(screen.getByText('Eagle Holdings Backend Command Center')).toBeInTheDocument();

    const principalRoleBtn = screen.getByRole('button', { name: /Principal View/i });
    fireEvent.click(principalRoleBtn);

    expect(screen.getByRole('heading', { level: 1, name: /Project Onboarding & Intake Portal/i })).toBeInTheDocument();
  });

  it('allows Admin to invite a new Project Principal and generate an invitation link', async () => {
    global.fetch.mockImplementation(async (url, options) => {
      if (url === '/api/auth/session') return { ok: true, json: async () => ({ authenticated: true, session: { role: 'ADMIN' } }) };
      if (url === '/api/onboarding') return { ok: true, json: async () => ({
        success: true,
        action: 'invite_principal',
        invitation: { inviteCode: 'INV-998877', inviteUrl: '/login?invite=INV-998877', sponsorName: 'Atlantic Port Systems', email: 'sponsor@atlantic.com', projectName: 'Port Expansion Facility', facilityAmount: '$60,000,000 USD', status: 'Pending Registration' }
      }) };
      return { ok: true, json: async () => ({}) };
    });

    render(<OnboardingPage />);
    
    // Wait for session to load
    await screen.findByRole('button', { name: /Admin View \(Backend\)/i });

    // Switch to Admin View
    fireEvent.click(screen.getByRole('button', { name: /Admin View \(Backend\)/i }));

    fireEvent.change(screen.getByLabelText(/Principal \/ Sponsor Name \*/i), { target: { value: 'Atlantic Port Systems' } });
    fireEvent.change(screen.getByLabelText(/Corporate Email \*/i), { target: { value: 'sponsor@atlantic.com' } });
    fireEvent.change(screen.getByLabelText(/Project Title \*/i), { target: { value: 'Port Expansion Facility' } });

    const inviteSubmitBtn = screen.getByRole('button', { name: /Generate & Send Principal Invitation/i });
    fireEvent.click(inviteSubmitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Invitation link generated for Atlantic Port Systems/i)).toBeInTheDocument();
    });

    expect(screen.getByText('/login?invite=INV-998877')).toBeInTheDocument();
    expect(screen.getByText('Atlantic Port Systems')).toBeInTheDocument();
  });

  it('allows Admin to approve checklist items and update status', async () => {
    global.fetch.mockImplementation(async (url, options) => {
      if (url === '/api/auth/session') return { ok: true, json: async () => ({ authenticated: true, session: { role: 'ADMIN' } }) };
      if (url === '/api/onboarding') return { ok: true, json: async () => ({ success: true, action: 'admin_update_status', itemId: 'item-03', status: 'Verified' }) };
      return { ok: true, json: async () => ({}) };
    });

    render(<OnboardingPage />);
    
    // Wait for session to load
    await screen.findByRole('button', { name: /Admin View \(Backend\)/i });

    // Switch to Admin View
    fireEvent.click(screen.getByRole('button', { name: /Admin View \(Backend\)/i }));

    // Switch to Data Submission Dropzone where action items and approve buttons exist
    fireEvent.click(screen.getByRole('button', { name: /Data Submission Dropzone/i }));

    const approveBtns = screen.getAllByRole('button', { name: /Approve/i });
    expect(approveBtns.length).toBeGreaterThan(0);

    fireEvent.click(approveBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/Audit status for item/i)).toBeInTheDocument();
    });
  });

  it('submits capital raise feedback in Principal view', async () => {
    global.fetch.mockImplementation(async (url, options) => {
      if (url === '/api/auth/session') return { ok: true, json: async () => ({ authenticated: true, session: { role: 'PRINCIPAL' } }) };
      if (url === '/api/onboarding') return { ok: true, json: async () => ({ success: true, action: 'submit_feedback', receiptId: 'FBK-ONBOARDING-1' }) };
      return { ok: true, json: async () => ({}) };
    });

    render(<OnboardingPage />);
    
    // Wait for component load
    await screen.findByLabelText(/Sponsor Feedback & Term Sheet Queries/i);

    const textarea = screen.getByLabelText(/Sponsor Feedback & Term Sheet Queries/i);
    fireEvent.change(textarea, { target: { value: 'Requesting lower interest rate for senior tranche.' } });

    const submitBtn = screen.getByRole('button', { name: /Submit Capital Raise Feedback/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Feedback successfully delivered/i)).toBeInTheDocument();
    });

    expect(screen.getByText('FBK-ONBOARDING-1')).toBeInTheDocument();
  });
});
