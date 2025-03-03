import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../Screens/LoginScreen';
import { AuthContext } from '../Service/AuthContext';

const mockLogin = jest.fn();

const navigation = {
    navigate: jest.fn(),
};

const renderComponent = () => {
    return render(
        <AuthContext.Provider value={{ login: mockLogin }}>
            <LoginScreen navigation={navigation} />
        </AuthContext.Provider>
    );
};

describe('LoginScreen', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText, getByTestId } = renderComponent();

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    
    const loginButton = getByTestId('login-button');
    expect(loginButton).toBeTruthy();
    const signUpButton = getByTestId('SignUp-button');
    expect(signUpButton).toBeTruthy();
   
});


    it('shows error message on failed login', async () => {
        mockLogin.mockResolvedValueOnce(false);
        const { getByPlaceholderText, getByText, getByTestId } = renderComponent();

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password');
        fireEvent.press(getByTestId('login-button'));

        await waitFor(() => {
            expect(getByText('Login failed. Please check your credentials.')).toBeTruthy();
        });
    });

    it('navigates to Main on successful login', async () => {
        mockLogin.mockResolvedValueOnce(true);
        const { getByPlaceholderText, getByTestId } = renderComponent();

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password');
        fireEvent.press(getByTestId('login-button'));

        await waitFor(() => {
            expect(navigation.navigate).toHaveBeenCalledWith('Main');
        });
    });

    it('navigates to Signup screen when Sign Up is pressed', () => {
        const { getByText } = renderComponent();

        fireEvent.press(getByText('Sign Up'));

        expect(navigation.navigate).toHaveBeenCalledWith('Signup');
    });
});