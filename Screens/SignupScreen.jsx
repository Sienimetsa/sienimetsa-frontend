import React, { useState, useContext, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ImageBackground, TouchableWithoutFeedback, Keyboard, Platform, KeyboardAvoidingView } from 'react-native';
import { AuthContext } from '../Service/AuthContext';
import TermsOfService from '../Components/TermsOfService';
import { Modal } from 'react-native';
import Toast from 'react-native-toast-message';

const SignupScreen = ({ navigation }) => {
  const { signup } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingSignupData, setPendingSignupData] = useState(null);

  const handleSignup = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!username || !password || !phone || !email || !country) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    try {
      // Attempt dry-run signup to validate input
      const success = await signup({
        username,
        password,
        phone,
        email,
        country,
        dryRun: true
      });

      if (success) {
        // If dry-run succeeds, store the signup data and show the Terms of Service modal
        setPendingSignupData({ username, password, phone, email, country });
        setShowTermsModal(true);
        setErrorMessage('');
      } else {
        setErrorMessage('Validation failed. Please check your input.');
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Validation error:', error);

      if (error.response && error.response.data) {
        setErrorMessage(error.response.data);
      } else {
        setErrorMessage('Signup validation failed. Please try again.');
      }

      setSuccessMessage('');
    }
  };

  const handleConfirmedSignup = async () => {
    if (!pendingSignupData) return;

    const { username, password, phone, email, country } = pendingSignupData;

    try {
      // Confirm signup after user accepts terms
      const success = await signup({
        username,
        password,
        phone,
        email,
        country
      });

      if (success) {
        setSuccessMessage('Signup successful!');
        setErrorMessage('');
        Toast.show({
          type: 'success',
          text1: 'Account created successfully',
          position: 'bottom',
          visibilityTime: 1000,
        });

        setTimeout(() => {
          navigation.navigate('Login');
        }, 1000);

      } else {
        setErrorMessage('Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during final signup:', error);
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data); 
      } else {
        setErrorMessage('Signup failed. Please check your input and try again.');
      }
    } finally {
      setPendingSignupData(null);
      setShowTermsModal(false);  
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
    });

    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  return (
    <ImageBackground
      source={require('../assets/Backgrounds/sieni-bg_2.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? -70 : 0}
          >
            <Text style={styles.heading}>Sign Up</Text>

            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="rgba(66, 54, 45, 0.76)"
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              placeholderTextColor="rgba(66, 54, 45, 0.76)"
            />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone"
              placeholderTextColor="rgba(66, 54, 45, 0.76)"
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              placeholderTextColor="rgba(66, 54, 45, 0.76)"
            />
            <TextInput
              style={styles.input}
              value={country}
              onChangeText={setCountry}
              placeholder="Country"
              placeholderTextColor="rgba(66, 54, 45, 0.76)"
            />

            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
            {successMessage ? <Text style={styles.successMessage}>{successMessage}</Text> : null}

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
            <Modal
              visible={showTermsModal}
              animationType="slide"
              transparent={false}
              onRequestClose={() => setShowTermsModal(false)}
            >
              <View style={{ flex: 1, paddingTop: 40, marginTop: 20 }}>
                <View style={{ flex: 1 }}>
                  <TermsOfService />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 20, marginBottom: 20 }}>
                  <TouchableOpacity onPress={handleConfirmedSignup}>
                    <Text style={{ fontSize: 18, color: 'green' }}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    setShowTermsModal(false);
                    setPendingSignupData(null);
                  }}>
                    <Text style={{ fontSize: 18, color: 'red' }}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </ImageBackground>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,

  },
  heading: {
    fontSize: 30,
    fontFamily: 'Nunito-bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "rgba(167, 156, 149, 0.75)",
    color: 'white',
    fontFamily: 'Nunito-Bold',
  },
  button: {
    backgroundColor: "#e1e0dc",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#574E47',
    fontSize: 18,
    fontFamily: 'Nunito-bold',
  },
  errorMessage: {
    color: "rgb(248, 208, 114)",
    textAlign: 'center',
    fontSize: 15,
    fontFamily: 'Nunito-bold',
    textShadowColor: 'rgba(74, 36, 36, 0.83)',
    textShadowOffset: { width: 1, height: 3 },
    textShadowRadius: 3,
    top: 10,
  },
  successMessage: {
    color: 'green',
    textAlign: 'center',
    marginBottom: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Nunito-Bold',
    textShadowColor: 'rgba(67, 43, 15, 0.75)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  loginLink: {
    fontSize: 17,
    color: "rgb(248, 208, 114)",
    fontFamily: 'Nunito-Bold',
    textShadowColor: 'rgba(52, 33, 12, 0.8)',
    textShadowOffset: { width: 1, height: 3 },
    textShadowRadius: 5,
  },
});

export default SignupScreen;

