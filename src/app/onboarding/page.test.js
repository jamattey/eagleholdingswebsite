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
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders page header and compliance progress meter', () => {
    render(<OnboardingPage />);
    expect(screen.getByRole('heading', { level: 1, name: /Project Onboarding & Intake Portal/i })).toBeInTheDocument();
    expect(screen.getByText(/Overall Project Compliance Clearance Status/i)).toBeInTheDocument();
  });

  it('displays lock overlay and blur prompt when unauthenticated in Principal view', () => {
    render(<OnboardingPage />);
    expect(screen.getByText(/Authentication Required to Access Data Room/i)).toBeInTheDocument();

    const unlockBtn = screen.getByRole('button', { name: /Log In as Project Principal to Unlock/i });
    expect(unlockBtn).toBeInTheDocument();

    fireEvent.click(unlockBtn);
    expect(mockPush).toHaveBeenCalledWith('/principal-login');
  });

  it('removes blur overlay when authenticated session is present', () => {
    const session = JSON.stringify({ token: 'SPON-123', principal: { name: 'Metro Infra' } });
    sessionStorage.setItem('eagle_principal_session', session);

    render(<OnboardingPage />);
    expect(screen.queryByText(/Authentication Required to Access Data Room/i)).not.toBeInTheDocument();
  });

  it('renders compliance items for KYC, UBO, CIS, Architectural, MEP, Soil, and Permits', () => {
    render(<OnboardingPage />);
    expect(screen.getByText('Personal KYC & Passport Verification')).toBeInTheDocument();
    expect(screen.getByText('Ultimate Beneficial Owner (UBO) Disclosures')).toBeInTheDocument();
    expect(screen.getByText('Corporate Banking Credentials & CIS')).toBeInTheDocument();
    expect(screen.getByText('Architectural & Structural Drawings')).toBeInTheDocument();
    expect(screen.getByText('Mechanical, Electrical, & Plumbing (MEP) Plans')).toBeInTheDocument();
    expect(screen.getByText('Geotechnical & Soil Test Reports')).toBeInTheDocument();
    expect(screen.getByText('Environmental & Municipal Building Permits')).toBeInTheDocument();
  });

  it('switches between Principal View and Admin View', () => {
    render(<OnboardingPage />);

    const adminRoleBtn = screen.getByRole('button', { name: /Admin View \(Backend\)/i });
    fireEvent.click(adminRoleBtn);

    expect(screen.getByRole('heading', { level: 1, name: /Deal Audit & Command Portal/i })).toBeInTheDocument();
    expect(screen.getByText('Eagle Holdings Backend Command Center')).toBeInTheDocument();

    const principalRoleBtn = screen.getByRole('button', { name: /Principal View/i });
    fireEvent.click(principalRoleBtn);

    expect(screen.getByRole('heading', { level: 1, name: /Project Onboarding & Intake Portal/i })).toBeInTheDocument();
  });

  it('allows Admin to invite a new Project Principal and generate an invitation link', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        action: 'invite_principal',
        invitation: {
          inviteCode: 'INV-998877',
          inviteUrl: '/principal-login?invite=INV-998877',
          sponsorName: 'Atlantic Port Systems',
          email: 'sponsor@atlantic.com',
          projectName: 'Port Expansion Facility',
          facilityAmount: '$60,000,000 USD',
          status: 'Pending Registration',
        },
      }),
    });

    render(<OnboardingPage />);

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

    expect(screen.getByText('/principal-login?invite=INV-998877')).toBeInTheDocument();
    expect(screen.getByText('Atlantic Port Systems')).toBeInTheDocument();
  });

  it('allows Admin to approve checklist items and update status', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        action: 'admin_update_status',
        itemId: 'item-03',
        status: 'Verified',
      }),
    });

    render(<OnboardingPage />);

    // Switch to Admin View
    fireEvent.click(screen.getByRole('button', { name: /Admin View \(Backend\)/i }));

    const approveBtns = screen.getAllByRole('button', { name: /Approve ✓/i });
    expect(approveBtns.length).toBeGreaterThan(0);

    fireEvent.click(approveBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/Audit status for item/i)).toBeInTheDocument();
    });
  });

  it('submits capital raise feedback in Principal view', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        action: 'submit_feedback',
        receiptId: 'FBK-ONBOARDING-1',
      }),
    });

    render(<OnboardingPage />);

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
