import React, { useState, useContext } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity,ImageBackground, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { AuthContext } from '../Service/AuthContext'; // Import AuthContext

const SignupScreen = ({ navigation }) => {
  const { signup } = useContext(AuthContext); // Access signup function from context
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignup = async () => {
    try {
      const success = await signup(username, password, phone, email, country);

      if (success) {
        setSuccessMessage('Signup successful!');
        setErrorMessage('');
        navigation.navigate('Login'); // Navigate to the login screen after successful signup
      } else {
        setErrorMessage('Signup failed. Please try again.');
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setErrorMessage('Signup failed. Please check your input and try again.');
      setSuccessMessage('');
    }
  };

  return (
      <ImageBackground
              source={require('../assets/Backgrounds/sieni-bg_2.jpg')}
              style={styles.container}
              resizeMode="cover"
            >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
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
    color:'white',
    fontFamily: 'Nunito-Bold',
  },
  button: {
    backgroundColor:"#e1e0dc",
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
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
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
    color: "rgb(237, 230, 109)",
    fontFamily: 'Nunito-Bold',
    textShadowColor: 'rgba(52, 33, 12, 0.8)',
    textShadowOffset: { width: 1, height: 3 },
    textShadowRadius: 5,
  },
});

export default SignupScreen;

