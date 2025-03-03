import React from 'react';
import { render, fireEvent, waitFor, screen,act } from '@testing-library/react-native';
import SettingScreen from '../Screens/SettingScreen';
import { AuthContext } from '../Service/AuthContext';
import { fetchCurrentUser, fetchAllUsers } from '../Components/Fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";


jest.mock('@react-native-async-storage/async-storage'); 
jest.mock("../Components/Fetch.js", () => ({
  fetchCurrentUser: jest.fn(),
  fetchAllUsers: jest.fn(),
}));
jest.mock("axios");

const mockSetUser = jest.fn();
const mockLogout = jest.fn();
const mockDeleteAccount = jest.fn().mockResolvedValue(true);
const mockNavigation = { navigate: jest.fn(), reset: jest.fn() };


// Mock user data and actions provided in AuthContext
const providerProps = {
  user: { username: 'testuser', profilePicture: 'pp1', chatColor: '#000000' },
  setUser: mockSetUser,
  logout: mockLogout,
  deleteAccount: mockDeleteAccount,
};

// beforeEach function runs before every individual test case
beforeEach(() => {
  jest.clearAllMocks();
  AsyncStorage.getItem.mockResolvedValue('mockToken'); // Mock token retrieval
  fetchCurrentUser.mockResolvedValue({ username: 'testuser', profilePicture: 'pp1', chatColor: '#000000' }); // Mock current user
  fetchAllUsers.mockResolvedValue({ _embedded: { appusers: [{ username: 'testuser' },{ username: 'otheruser' }] } }); // Mock all users
});

// Utility function to render the component with context
const renderWithContext = (ui) => {
  return render(
    <AuthContext.Provider value={providerProps}>{ui}</AuthContext.Provider>
  );
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Ensures all SettingScreen components are rendered correctly
describe('SettingScreen', () => {
  it('renders SettingScreen components correctly', () => {
    renderWithContext(<SettingScreen navigation={mockNavigation} />);

    expect(screen.getByText('Edit Profile')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter new username')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter chat color (e.g., #ff5733)')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter new password')).toBeTruthy();
    expect(screen.getByText('Save Changes')).toBeTruthy();
    expect(screen.getByText('Delete Account')).toBeTruthy();
  });

  
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // USER TRIES TO UPDATE USERNAME WITH ALREADY INUSE NAME
  it('checks username availability and shows error when taken', async () => {
    renderWithContext(<SettingScreen navigation={mockNavigation} />);
  
    const usernameInput = screen.getByPlaceholderText('Enter new username');
    fireEvent.changeText(usernameInput, 'otheruser'); // User tries to take already taken
    fireEvent.press(screen.getByTestId('SaveChanges'));
  
    await waitFor(() => {
      const errorMessage = screen.queryByText("Username is already taken!"); // Error message shown
      expect(errorMessage).toBeTruthy();  
    });
  });
  

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

 // UPDATES USERNAME AND CHAT COLOR SUCCESSFULLY
  it('checks username availability and allows update when available', async () => {
    fetchAllUsers.mockResolvedValueOnce({
      _embedded: { appusers: [{ username: 'otheruser' }] }, // 'newuser' is available
    });

    axios.put.mockResolvedValue({ status: 200 });

    renderWithContext(<SettingScreen navigation={mockNavigation} />);

    fireEvent.changeText(screen.getByPlaceholderText('Enter new username'), 'newuser');
    fireEvent.changeText(screen.getByPlaceholderText('Enter chat color (e.g., #ff5733)'), '#ff5733');

    await act(async () => {
      fireEvent.press(screen.getByTestId('SaveChanges'));
    });
    
    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith({ //User data updated
        username: 'newuser',
        profilePicture: 'pp1',
        chatColor: '#ff5733',
      });
    });
  });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//PROFILE PICTURE SELECTION AND USERNAME CHANGE
it('opens and selects profile picture', async () => {
  renderWithContext(<SettingScreen navigation={mockNavigation} />);

  fireEvent.press(screen.getByText('Change Profile Picture'));

  expect(screen.getByText('Choose Profile Picture')).toBeTruthy();

  fireEvent.press(screen.getByTestId('profile-picture-pp2'));

  expect(screen.queryByText('Choose Profile Picture')).toBeNull(); // ensures modal is closed

  fireEvent.changeText(screen.getByPlaceholderText('Enter new username'), 'katti');

  await act(async () => {
    fireEvent.press(screen.getByTestId('SaveChanges'));
  });
  await waitFor(() => {
    expect(mockSetUser).toHaveBeenCalledWith({ //User data updated
      username: 'katti',
      profilePicture: 'pp2',
      chatColor: '#000000',
    });
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

   //DELETE ACCOUNT SUCCESSFULLY
  it('deletes account and logs out', async () => {
    renderWithContext(<SettingScreen navigation={mockNavigation} />);
    fireEvent.press(screen.getByText('Delete Account'));

    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalled(); // Account deleted
      expect(mockLogout).toHaveBeenCalled(); // user is logged out
      expect(mockNavigation.reset).toHaveBeenCalledWith({ // navigation stack is cleared and directed to login
        index: 0,
        routes: [{ name: 'Login' }],
      });
    });
  });


  
});

