import { render, screen, fireEvent } from '@testing-library/react';
import PartnerLogin from './page';

describe('Partner Login Page', () => {
  it('renders the main heading and description', () => {
    render(<PartnerLogin />);
    expect(screen.getByRole('heading', { level: 1, name: /Partner Portal/i })).toBeInTheDocument();
    expect(screen.getByText(/Secure access to global strategic briefings/i)).toBeInTheDocument();
  });

  it('renders form inputs for Partner ID and Security Key', () => {
    render(<PartnerLogin />);
    
    const partnerIdInput = screen.getByLabelText(/Partner ID/i);
    expect(partnerIdInput).toBeInTheDocument();
    expect(partnerIdInput).toHaveAttribute('type', 'text');
    expect(partnerIdInput).toBeRequired();

    const securityKeyInput = screen.getByLabelText(/Security Key/i);
    expect(securityKeyInput).toBeInTheDocument();
    expect(securityKeyInput).toHaveAttribute('type', 'password');
    expect(securityKeyInput).toBeRequired();
  });

  it('renders the submit button and request credentials link', () => {
    render(<PartnerLogin />);
    
    const submitBtn = screen.getByRole('button', { name: /Authenticate/i });
    expect(submitBtn).toBeInTheDocument();

    const requestLink = screen.getByRole('link', { name: /Request Credentials/i });
    expect(requestLink).toBeInTheDocument();
    expect(requestLink).toHaveAttribute('href', '/request-credentials');
  });

  it('allows user interaction on input fields', () => {
    render(<PartnerLogin />);

    const partnerIdInput = screen.getByLabelText(/Partner ID/i);
    const securityKeyInput = screen.getByLabelText(/Security Key/i);

    fireEvent.change(partnerIdInput, { target: { value: 'PARTNER123' } });
    fireEvent.change(securityKeyInput, { target: { value: 'SecretPass123' } });

    expect(partnerIdInput.value).toBe('PARTNER123');
    expect(securityKeyInput.value).toBe('SecretPass123');
  });
});
