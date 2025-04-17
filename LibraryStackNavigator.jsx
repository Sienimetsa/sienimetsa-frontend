import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LibraryScreen from './Screens/LibraryScreen';
import FindingsScreen from './Screens/Findings/FindingsScreen';

const Stack = createStackNavigator();

export default function LibraryStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="LibraryMain" 
        component={LibraryScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="FindingsScreen" 
        component={FindingsScreen}
        options={({ navigation }) => ({
          headerShown: true,
          title: "Findings",
          headerTintColor: 'white',
          headerStyle: {
            backgroundColor: '#574E47',
            shadowColor: 'transparent',
            elevation: 0,
            borderBottomWidth: 0,
          },
          headerTitleStyle: { fontFamily: 'Nunito-Bold' },
          headerLeft: () => (
            <TouchableOpacity
              style={{ marginLeft: 15 }}
              onPress={() => navigation.navigate('LibraryMain')}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
}