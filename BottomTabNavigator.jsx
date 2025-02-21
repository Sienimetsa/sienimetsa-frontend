import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'react-native';
import ChatScreen from './Screens/ChatScreen';
import HomeScreen from './Screens/HomeScreen';
import LibraryScreen from './Screens/LibraryScreen';
import { AuthContext } from './Service/AuthContext';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator({ navigation }) {
  const { logout } = useContext(AuthContext);  // Get logout function from AuthContext

  // Handle logout logic
  const handleLogout = async () => {
    await logout();  // Call the logout function from the context
    navigation.navigate('Login');  // Navigate to the login screen after logout
  };

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Library') {
            iconName = focused ? 'library' : 'library-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'gray',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Home" component={HomeScreen} 
        options={{
          headerRight: () => (
            <Button title="Log Out" onPress={handleLogout} color="black" />
          ),
        }} 
      />
      <Tab.Screen name="Library" component={LibraryScreen} />
    </Tab.Navigator>
  );
}
