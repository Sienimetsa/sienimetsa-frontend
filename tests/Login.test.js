import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import Login from '../Screens/LoginScreen'; // Adjust the path as needed
import { act } from 'react-test-renderer';
import AuthService from '../Service/AuthService';

//mocks api call
jest.mock('../Service/AuthService', () => ({
  login: jest.fn(),
}));

describe('LoginScreen', () => {
  it('calls onLogin with correct credentials when login is pressed', async () => {
    // Mocks login
    AuthService.login.mockResolvedValueOnce({ success: true });

    render(<Login navigation={{ navigate: jest.fn() }} />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByTestId('login-button');

    // Fake user info
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    await act(async () => {
      fireEvent.press(loginButton);
    });
    await waitFor(() => {
      expect(screen.queryByText('Login failed')).toBeNull();//no error
    });
    expect(AuthService.login).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});
