import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ChatScreen from './Screens/ChatScreen';
import HomeScreen from './Screens/HomeScreen';
import ProfileScreen from './Screens/ProfileScreen'; // Import ProfileScreen
import LibraryStackNavigator from './LibraryStackNavigator';
import LogoutButton from './Components/LogoutButton'; // Import LogoutButton

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator({ navigation }) {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Home') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'Library') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarShowLabel: false, // Hide text labels
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'white',
        tabBarStyle: {
          backgroundColor: '#574E47', // Change bottom tab background color
          borderTopWidth: 0, // Remove top border
          paddingTop: 10,
        },
        headerStyle: {
          backgroundColor: '#574E47',
          shadowColor: 'transparent', // Remove shadow on iOS
          elevation: 0, // Remove shadow on Android
          borderBottomWidth: 0, // Remove bottom border
          height: 80, // Increase header height
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontFamily: 'Nunito-Bold',
          marginBottom: 10,
         },
      })}
    >
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen
        name="Home"
        component={HomeScreen}

      />
      <Tab.Screen
        name="Library"
        component={LibraryStackNavigator}
        options={({ route }) => ({
          headerShown: shouldShowHeader(route),
          headerTitle: getHeaderTitle(route),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'library' : 'library-outline'}
              size={size}
              color={color}
            />
          ),
          tabBarStyle: ((route) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'LibraryMain';
            if (routeName === 'FindingsScreen') {
              return { display: 'none' };
            }
            return {
              backgroundColor: '#574E47',
              borderTopWidth: 0,
              paddingTop: 10,
            };
          })(route),
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerRight: () => <LogoutButton navigation={navigation} />,
        }}
      />
    </Tab.Navigator>
  );
}

function shouldShowHeader(route) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'LibraryMain';
  return routeName !== 'FindingsScreen';
}

function getHeaderTitle(route) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'LibraryMain';

  switch (routeName) {
    case 'FindingsScreen':
      return 'Findings';
    default:
      return 'Library';
  }
}