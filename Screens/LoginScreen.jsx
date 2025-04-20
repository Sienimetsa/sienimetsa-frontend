import React, { useState, useContext } from 'react';
import { View, TextInput, Dimensions, Text, StyleSheet,ImageBackground, TouchableOpacity, TouchableWithoutFeedback, Keyboard,Image } from 'react-native';
import { AuthContext } from '../Service/AuthContext';
import LogoText from "../assets/loginScreen/sienimetsa-text.png"
import Logo from "../assets/loginScreen/sienimetsa-logo.png"
const { width } = Dimensions.get('window');
const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    const success = await login(email, password); //  gets AuthContext logic for login
    if (success) {
      navigation.navigate('Main');
    } else {
      {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
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
       < View style={{flexDirection: "column", alignItems: 'center'}}>
         <Image source={Logo} style={{ width: 100, height: 105, marginBottom: -28 }} />
          <Image source={LogoText} style={styles.logo} />
     </View>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="rgba(66, 54, 45, 0.76)"
          style={styles.input}
          keyboardType="email-address"
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
            placeholderTextColor="rgba(66, 54, 45, 0.76)"
          style={styles.input}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}
          testID="login-button">
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}
            testID="SignUp-button">
            <Text style={styles.signupLink}>Sign Up</Text>
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 60,
    shadowColor: '#000',
  },
  footerText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Nunito-Bold',
    textShadowColor: 'rgba(67, 43, 15, 0.75)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
    
  },
  signupLink: {
    fontSize: 17,
    color: "rgb(237, 230, 109)",
    fontFamily: 'Nunito-Bold',
    textShadowColor: 'rgba(52, 33, 12, 0.8)',
    textShadowOffset: { width: 1, height: 3 },
    textShadowRadius: 5,
  },
  logo: {
    width: width * 0.8,   // 80% of screen width
    height: width * 0.32, // Maintain aspect ratio (e.g., 500:200 = 2.5)
    resizeMode: 'contain', // Prevents stretching
  },
  errorMessage: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'Nunito-Bold',
  },
});

export default LoginScreen;
