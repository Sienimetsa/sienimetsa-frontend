import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './Screens/LoginScreen';
import SignupScreen from './Screens/SignupScreen';
import ProfileScreen from './Screens/ProfileScreen';
import BottomTabNavigator from './BottomTabNavigator';
import { AuthProvider } from './Service/AuthContext';
import CreateFindingScreen from './Screens/CreateFindingScreen';
import * as Font from 'expo-font';
import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Nunito-Bold': require('./assets/fonts/Nunito-Bold.ttf'),
        'Nunito-Light': require('./assets/fonts/Nunito-Light.ttf'),
        'Nunito-Medium': require('./assets/fonts/Nunito-Medium.ttf'),
        'Nunito-Regular': require('./assets/fonts/Nunito-Regular.ttf'),
        'Nunito-SemiBold': require('./assets/fonts/Nunito-SemiBold.ttf'),
        'Nunito-Black': require('./assets/fonts/Nunito-Black.ttf'),
        'Nunito-ExtraBold': require('./assets/fonts/Nunito-ExtraBold.ttf'),
        'Nunito-ExtraLight': require('./assets/fonts/Nunito-ExtraLight.ttf'),
        'Nunito-Italic': require('./assets/fonts/Nunito-Italic.ttf'),
        'Nunito-BoldItalic': require('./assets/fonts/Nunito-BoldItalic.ttf'),
        'Nunito-LightItalic': require('./assets/fonts/Nunito-LightItalic.ttf'),
        'Nunito-MediumItalic': require('./assets/fonts/Nunito-MediumItalic.ttf'),
        'Nunito-SemiBoldItalic': require('./assets/fonts/Nunito-SemiBoldItalic.ttf'),
        'Nunito-BlackItalic': require('./assets/fonts/Nunito-BlackItalic.ttf'),
        'Nunito-ExtraBoldItalic': require('./assets/fonts/Nunito-ExtraBoldItalic.ttf'),
        'Nunito-ExtraLightItalic': require('./assets/fonts/Nunito-ExtraLightItalic.ttf'),
      });
      setFontsLoaded(true);
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#574E47" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login"
          screenOptions={{
            headerStyle: { backgroundColor: '#574E47' }, // header background color
            headerTintColor: '#ffffff', // header text/icon color
            headerTitleStyle: { fontWeight: 'bold', fontFamily: 'Nunito-Bold' }, // title font weight and family
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Main" component={BottomTabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen
            name="CreateFinding"
            component={CreateFindingScreen}
            options={({ navigation }) => ({
              headerTitle: "Create New Finding",
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
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
              ),
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>

  );
}