import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

import ContactPage from './page';

describe('Contact Page', () => {
  beforeEach(() => {
    // Mock global fetch for session check on Header mount
    global.fetch = jest.fn().mockImplementation(async (url) => {
      if (url === '/api/auth/session') {
        return { ok: true, json: async () => ({ authenticated: false, session: null }) };
      }
      return { ok: true, json: async () => ({}) };
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the contact form and headings', () => {
    render(<ContactPage />);
    expect(screen.getByRole('heading', { level: 1, name: /Initiate a Consultation/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Organization/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Area of Inquiry \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Message \*/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Inquiry/i })).toBeInTheDocument();
  });

  it('allows user input in form fields', () => {
    render(<ContactPage />);
    
    const nameInput = screen.getByLabelText(/Full Name \*/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    expect(nameInput.value).toBe('John Doe');

    const emailInput = screen.getByLabelText(/Email Address \*/i);
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    expect(emailInput.value).toBe('john@example.com');

    const messageInput = screen.getByLabelText(/Your Message \*/i);
    fireEvent.change(messageInput, { target: { value: 'Inquiry details here' } });
    expect(messageInput.value).toBe('Inquiry details here');
  });

  it('fails submission if privacy consent is not checked', async () => {
    render(<ContactPage />);
    
    fireEvent.change(screen.getByLabelText(/Full Name \*/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address \*/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Your Message \*/i), { target: { value: 'Inquiry details here' } });
    
    // Do not check privacy consent
    
    fireEvent.click(screen.getByRole('button', { name: /Submit Inquiry/i }));

    await waitFor(() => {
      expect(screen.getByText('Please confirm you have read and agree to our Privacy Policy.')).toBeInTheDocument();
    });
  });

  it('fails submission if altcha payload is missing', async () => {
    render(<ContactPage />);
    
    fireEvent.change(screen.getByLabelText(/Full Name \*/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address \*/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Your Message \*/i), { target: { value: 'Inquiry details here' } });
    
    // Check privacy consent
    const consentCheckbox = screen.getByLabelText(/I have read and agree to the/i);
    fireEvent.click(consentCheckbox);
    
    // Altcha payload is missing (null)

    fireEvent.click(screen.getByRole('button', { name: /Submit Inquiry/i }));

    await waitFor(() => {
      expect(screen.getByText('Please complete the security check before submitting.')).toBeInTheDocument();
    });
  });

  it('submits successfully when valid', async () => {
    global.fetch.mockImplementation(async (url) => {
      if (url === '/api/auth/session') {
        return { ok: true, json: async () => ({ authenticated: false, session: null }) };
      }
      if (url === '/api/contact') {
        return { ok: true, json: async () => ({ success: true }) };
      }
      return { ok: true, json: async () => ({}) };
    });

    const { container } = render(<ContactPage />);
    
    fireEvent.change(screen.getByLabelText(/Full Name \*/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address \*/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Area of Inquiry \*/i), { target: { value: 'General Inquiry' } });
    fireEvent.change(screen.getByLabelText(/Your Message \*/i), { target: { value: 'Inquiry details here' } });
    
    // Check privacy consent
    const consentCheckbox = screen.getByLabelText(/I have read and agree to the/i);
    fireEvent.click(consentCheckbox);
    
    // Mock altcha widget payload
    const altchaWidget = container.querySelector('altcha-widget');
    Object.defineProperty(altchaWidget, 'value', { value: 'mocked_payload', writable: true });

    fireEvent.click(screen.getByRole('button', { name: /Submit Inquiry/i }));

    await waitFor(() => {
      expect(screen.getByText(/Submission Received/i)).toBeInTheDocument();
      expect(screen.getByText(/Thank you for reaching out/i)).toBeInTheDocument();
    });
  });

  it('displays error if API returns an error', async () => {
    global.fetch.mockImplementation(async (url) => {
      if (url === '/api/auth/session') {
        return { ok: true, json: async () => ({ authenticated: false, session: null }) };
      }
      if (url === '/api/contact') {
        return { ok: false, json: async () => ({ error: 'Server validation failed' }) };
      }
      return { ok: true, json: async () => ({}) };
    });

    const { container } = render(<ContactPage />);
    
    fireEvent.change(screen.getByLabelText(/Full Name \*/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address \*/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Area of Inquiry \*/i), { target: { value: 'General Inquiry' } });
    fireEvent.change(screen.getByLabelText(/Your Message \*/i), { target: { value: 'Inquiry details here' } });
    
    // Check privacy consent
    const consentCheckbox = screen.getByLabelText(/I have read and agree to the/i);
    fireEvent.click(consentCheckbox);
    
    // Mock altcha widget payload
    const altchaWidget = container.querySelector('altcha-widget');
    Object.defineProperty(altchaWidget, 'value', { value: 'mocked_payload', writable: true });

    fireEvent.click(screen.getByRole('button', { name: /Submit Inquiry/i }));

    await waitFor(() => {
      expect(screen.getByText('Server validation failed')).toBeInTheDocument();
    });
  });
});
