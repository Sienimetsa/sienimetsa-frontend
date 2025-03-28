import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './Screens/LoginScreen';
import SignupScreen from './Screens/SignupScreen';
import ProfileScreen from './Screens/ProfileScreen';
import BottomTabNavigator from './BottomTabNavigator';
import { AuthProvider } from './Service/AuthContext';
import CreateFindingScreen from './Screens/CreateFindingScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login"
       screenOptions={{
        headerStyle: { backgroundColor: '#574E47' }, // header background color
        headerTintColor: '#ffffff', // header text/icon color
        headerTitleStyle: { fontWeight: 'bold' }, // title font weight
      }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={BottomTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="CreateFinding" component={CreateFindingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  </AuthProvider>
  
  );
}