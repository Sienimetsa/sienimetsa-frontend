import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LibraryScreen from './Screens/LibraryScreen';
import FindingsScreen from './Screens/FindingsScreen';

const Stack = createStackNavigator();

export default function LibraryStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LibraryMain" component={LibraryScreen} />
      <Stack.Screen name="FindingsScreen" component={FindingsScreen} />
    </Stack.Navigator>
  );
}
