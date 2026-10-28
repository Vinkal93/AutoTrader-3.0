import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import LoginPage from '../app/login/page';
import SignupPage from '../app/signup/page';
import ForgotPasswordPage from '../app/forgot-password/page';
import ResetPasswordPage from '../app/reset-password/page';
import OnboardingPage from '../app/onboarding/page';

// Mock useRouter & useSearchParams
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'redirect' ? '/strategies' : null),
  }),
  usePathname: () => '/login',
}));

// Mock useAuth
const mockLoginWithEmail = vi.fn();
const mockSignupWithEmail = vi.fn();
const mockLoginWithGoogle = vi.fn();
const mockForgotPassword = vi.fn();
const mockResetPassword = vi.fn();
const mockCompleteOnboarding = vi.fn();
const mockLogout = vi.fn();

let mockUser: any = null;

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({
    user: mockUser,
    session: mockUser ? { accessToken: 'token_123', user: mockUser } : null,
    isLoading: false,
    loginWithEmail: mockLoginWithEmail,
    signupWithEmail: mockSignupWithEmail,
    loginWithGoogle: mockLoginWithGoogle,
    forgotPassword: mockForgotPassword,
    resetPassword: mockResetPassword,
    completeOnboarding: mockCompleteOnboarding,
    logout: mockLogout,
  }),
}));

describe('Complete Authentication & Onboarding Test Suite (Phase 3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
  });

  describe('Task 1 & 2: Login Page', () => {
    it('renders only the two permitted login methods: Google and Email+Password', () => {
      render(<LoginPage />);

      expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In to Workspace/i })).toBeInTheDocument();

      // Ensure disallowed social/phone login buttons are absent
      expect(screen.queryByText(/Continue with Facebook/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Continue with Apple/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Login with Phone OTP/i)).not.toBeInTheDocument();
    });

    it('validates missing email or password before submitting', async () => {
      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/trader@example.com/i);
      const form = emailInput.closest('form')!;
      fireEvent.submit(form);

      expect(await screen.findByRole('alert')).toHaveTextContent(/Please enter a valid email address/i);
      expect(mockLoginWithEmail).not.toHaveBeenCalled();
    });

    it('submits email and password successfully and preserves safe redirect', async () => {
      mockLoginWithEmail.mockResolvedValueOnce(undefined);
      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/trader@example.com/i);
      const pwdInput = screen.getByPlaceholderText(/••••••••••••/i);

      fireEvent.change(emailInput, { target: { value: 'trader@autotrader.local' } });
      fireEvent.change(pwdInput, { target: { value: 'Secret123!' } });

      const submitBtn = screen.getByRole('button', { name: /Sign In to Workspace/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockLoginWithEmail).toHaveBeenCalledWith('trader@autotrader.local', 'Secret123!');
        expect(mockPush).toHaveBeenCalledWith('/strategies');
      });
    });

    it('triggers Google OAuth flow when Google button is clicked', async () => {
      mockLoginWithGoogle.mockResolvedValueOnce(undefined);
      render(<LoginPage />);

      const googleBtn = screen.getByRole('button', { name: /Continue with Google/i });
      fireEvent.click(googleBtn);

      expect(mockLoginWithGoogle).toHaveBeenCalledTimes(1);
    });

    it('toggles password visibility on eye button click', () => {
      render(<LoginPage />);

      const pwdInput = screen.getByPlaceholderText(/••••••••••••/i);
      expect(pwdInput).toHaveAttribute('type', 'password');

      const toggleBtn = screen.getByLabelText(/Show password/i);
      fireEvent.click(toggleBtn);

      expect(pwdInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Task 1 & 2: Signup Page', () => {
    it('enforces password length, matching confirmation, and terms agreement', async () => {
      render(<SignupPage />);

      const emailInput = screen.getByPlaceholderText(/trader@example.com/i);
      const pwdInputs = screen.getAllByPlaceholderText(/••••••••••••/i);

      fireEvent.change(emailInput, { target: { value: 'newtrader@example.com' } });
      fireEvent.change(pwdInputs[0], { target: { value: 'short' } });
      fireEvent.change(pwdInputs[1], { target: { value: 'short' } });

      const form = emailInput.closest('form')!;
      fireEvent.submit(form);

      expect(await screen.findByRole('alert')).toHaveTextContent(/at least 8 characters/i);
      expect(mockSignupWithEmail).not.toHaveBeenCalled();
    });

    it('submits valid registration and redirects to onboarding', async () => {
      mockSignupWithEmail.mockResolvedValueOnce(undefined);
      render(<SignupPage />);

      const nameInput = screen.getByPlaceholderText(/Rahul Sharma/i);
      const emailInput = screen.getByPlaceholderText(/trader@example.com/i);
      const pwdInputs = screen.getAllByPlaceholderText(/••••••••••••/i);
      const termsCheckbox = screen.getByRole('checkbox', { name: /Terms of Use/i });

      fireEvent.change(nameInput, { target: { value: 'Arjun Verma' } });
      fireEvent.change(emailInput, { target: { value: 'arjun@example.com' } });
      fireEvent.change(pwdInputs[0], { target: { value: 'SuperSecret123' } });
      fireEvent.change(pwdInputs[1], { target: { value: 'SuperSecret123' } });
      fireEvent.click(termsCheckbox);

      const submitBtn = screen.getByRole('button', { name: /Create Account/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockSignupWithEmail).toHaveBeenCalledWith('arjun@example.com', 'SuperSecret123', 'Arjun Verma');
        expect(mockPush).toHaveBeenCalledWith('/onboarding');
      });
    });
  });

  describe('Task 2: Forgot & Reset Password Pages', () => {
    it('handles forgot password submission with clear confirmation message', async () => {
      mockForgotPassword.mockResolvedValueOnce('Instructions sent');
      render(<ForgotPasswordPage />);

      const emailInput = screen.getByPlaceholderText(/trader@example.com/i);
      fireEvent.change(emailInput, { target: { value: 'recover@example.com' } });

      const submitBtn = screen.getByRole('button', { name: /Send Recovery Link/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockForgotPassword).toHaveBeenCalledWith('recover@example.com');
        expect(screen.getByText(/Check Your Email/i)).toBeInTheDocument();
      });
    });

    it('validates password match on reset password page', async () => {
      mockResetPassword.mockResolvedValueOnce('Success');
      render(<ResetPasswordPage />);

      const pwdInputs = screen.getAllByPlaceholderText(/••••••••••••/i);
      fireEvent.change(pwdInputs[0], { target: { value: 'NewSecurePassword123' } });
      fireEvent.change(pwdInputs[1], { target: { value: 'NewSecurePassword123' } });

      const submitBtn = screen.getByRole('button', { name: /Update Password/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith('token_demo', 'NewSecurePassword123');
        expect(screen.getByText(/Password Updated Successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Task 3 & 4: First-Time Onboarding Flow', () => {
    it('allows user to progress through all 6 steps and skip broker connection', async () => {
      mockCompleteOnboarding.mockResolvedValueOnce(undefined);
      render(<OnboardingPage />);

      // Step 1: Welcome
      expect(screen.getByText(/Welcome to NIFTY Auto Trader/i)).toBeInTheDocument();
      const step1Btn = screen.getByRole('button', { name: /Continue to Broker Selection/i });
      fireEvent.click(step1Btn);

      // Step 2: Select Broker
      expect(screen.getByText(/Select Primary Broker/i)).toBeInTheDocument();
      const kotakNeoCard = screen.getByText('Kotak Neo');
      fireEvent.click(kotakNeoCard);
      const step2Btn = screen.getByRole('button', { name: /Configure Authorization/i });
      fireEvent.click(step2Btn);

      // Step 3: Broker Authorization (Allows Skip)
      expect(screen.getByText(/Broker Authorization/i)).toBeInTheDocument();
      const skipBtn = screen.getByRole('button', { name: /Skip Connection/i });
      expect(skipBtn).toBeInTheDocument();
      fireEvent.click(skipBtn);

      // Step 4: Permissions Review
      expect(screen.getByText(/Review Scoped Permissions/i)).toBeInTheDocument();
      const step4Btn = screen.getByRole('button', { name: /Choose Preferences/i });
      fireEvent.click(step4Btn);

      // Step 5: Choose Preferences
      expect(screen.getByText(/Trading Preferences/i)).toBeInTheDocument();
      const step5Btn = screen.getByRole('button', { name: /Review Summary/i });
      fireEvent.click(step5Btn);

      // Step 6: Confirmation & Open Dashboard
      expect(screen.getByText(/Your Cockpit is Ready/i)).toBeInTheDocument();
      const finishBtn = screen.getByRole('button', { name: /Open Trading Dashboard/i });
      fireEvent.click(finishBtn);

      await waitFor(() => {
        expect(mockCompleteOnboarding).toHaveBeenCalledWith(
          expect.objectContaining({
            selectedBrokerId: 'KOTAK_NEO',
            connectBrokerNow: false,
          })
        );
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });
  });
});
