import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './Screens/LoginScreen';
import SignupScreen from './Screens/SignupScreen';
import SettingScreen from './Screens/SettingScreen';
import CreateFindingScreen from './Screens/CreateFindingScreen';
import BottomTabNavigator from './BottomTabNavigator';
import { AuthProvider } from './Service/AuthContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={BottomTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={SettingScreen} />
        <Stack.Screen name="CreateFinding" component={CreateFindingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  </AuthProvider>
  
  );
}