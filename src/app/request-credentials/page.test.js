import { render, screen, fireEvent } from '@testing-library/react';
import RequestCredentials from './page';

describe('Request Credentials Page', () => {
  it('renders the main heading and description', () => {
    render(<RequestCredentials />);
    expect(screen.getByRole('heading', { level: 1, name: /Credential Request/i })).toBeInTheDocument();
    expect(screen.getByText(/New stakeholders may request access to the Partner Portal/i)).toBeInTheDocument();
  });

  it('renders form inputs for First Name, Last Name, Corporate Email, and Purpose', () => {
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

  it('allows user input in all form fields', () => {
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
});
