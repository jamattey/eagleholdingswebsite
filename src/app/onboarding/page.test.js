import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OnboardingPage from './page';

describe('Onboarding Portal Page', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders page header and compliance progress meter', () => {
    render(<OnboardingPage />);
    expect(screen.getByRole('heading', { level: 1, name: /Project Onboarding & Intake Portal/i })).toBeInTheDocument();
    expect(screen.getByText(/Overall Project Compliance Clearance Status/i)).toBeInTheDocument();
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

  it('allows Admin to modify and save offer terms', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        action: 'admin_update_terms',
      }),
    });

    render(<OnboardingPage />);

    // Switch to Admin View
    fireEvent.click(screen.getByRole('button', { name: /Admin View \(Backend\)/i }));

    const saveBtn = screen.getByRole('button', { name: /Update Offer Terms/i });
    expect(saveBtn).toBeInTheDocument();

    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Capital raise offer terms updated successfully/i)).toBeInTheDocument();
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
