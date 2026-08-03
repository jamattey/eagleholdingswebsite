import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RequestCredentials from './page';

describe('Request Credentials Page', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the main heading and description', () => {
    render(<RequestCredentials />);
    expect(screen.getByRole('heading', { level: 1, name: /Credential Request/i })).toBeInTheDocument();
    expect(screen.getByText(/New stakeholders may request access to the Partner Portal/i)).toBeInTheDocument();
  });

  it('renders form inputs for First Name, Last Name, Corporate Email, Organization, and Purpose', () => {
    render(<RequestCredentials />);

    const firstNameInput = screen.getByLabelText(/First Name/i);
    expect(firstNameInput).toBeInTheDocument();
    expect(firstNameInput).toBeRequired();

    const lastNameInput = screen.getByLabelText(/Last Name/i);
    expect(lastNameInput).toBeInTheDocument();
    expect(lastNameInput).toBeRequired();

    const emailInput = screen.getByLabelText(/Corporate Email/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toBeRequired();

    const organizationInput = screen.getByLabelText(/Organization \/ Firm/i);
    expect(organizationInput).toBeInTheDocument();

    const purposeInput = screen.getByLabelText(/Purpose of Request/i);
    expect(purposeInput).toBeInTheDocument();
    expect(purposeInput).toBeRequired();
  });

  it('renders the disclaimer notice and submit button', () => {
    render(<RequestCredentials />);

    expect(screen.getByText(/Credentials will be issued only to verified stakeholders/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Submit Request/i });
    expect(submitBtn).toBeInTheDocument();
  });

  it('allows user input in form fields', () => {
    render(<RequestCredentials />);

    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);
    const emailInput = screen.getByLabelText(/Corporate Email/i);
    const purposeInput = screen.getByLabelText(/Purpose of Request/i);

    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'jane.doe@company.com' } });
    fireEvent.change(purposeInput, { target: { value: 'Strategic investment briefing request.' } });

    expect(firstNameInput.value).toBe('Jane');
    expect(lastNameInput.value).toBe('Doe');
    expect(emailInput.value).toBe('jane.doe@company.com');
    expect(purposeInput.value).toBe('Strategic investment briefing request.');
  });

  it('submits the form successfully and displays reference ID and confirmation', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, referenceId: 'REQ-123456-ABC' }),
    });

    render(<RequestCredentials />);

    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Corporate Email/i), { target: { value: 'jane.doe@company.com' } });
    fireEvent.change(screen.getByLabelText(/Purpose of Request/i), { target: { value: 'Portal access request.' } });

    const submitBtn = screen.getByRole('button', { name: /Submit Request/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Request Submitted/i)).toBeInTheDocument();
    });

    expect(screen.getByText('REQ-123456-ABC')).toBeInTheDocument();
    expect(screen.getByText(/Thank you,/i)).toBeInTheDocument();

    // Can reset form to submit another request
    fireEvent.click(screen.getByRole('button', { name: /Submit Another Request/i }));
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
  });

  it('displays an error message when form submission fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Corporate email is already registered.' }),
    });

    render(<RequestCredentials />);

    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Corporate Email/i), { target: { value: 'jane.doe@company.com' } });
    fireEvent.change(screen.getByLabelText(/Purpose of Request/i), { target: { value: 'Portal access request.' } });

    fireEvent.click(screen.getByRole('button', { name: /Submit Request/i }));

    await waitFor(() => {
      expect(screen.getByText('Corporate email is already registered.')).toBeInTheDocument();
    });
  });
});
