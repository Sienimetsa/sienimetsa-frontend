import React, { useState, useContext, useEffect } from 'react';
import { View, TextInput, Dimensions, Text, ScrollView, StyleSheet, ImageBackground, Modal, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../Service/AuthContext';
import LogoText from "../assets/loginScreen/sienimetsa-text.png"
import Logo from "../assets/loginScreen/sienimetsa-logo.png"
import TermsOfService from '../Components/TermsOfService';
import PrivacyPolicy from '../Components/PrivacyPolicy';
import Toast from 'react-native-toast-message';
const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (type, message) => {
    Toast.show({
      type: type,
      text1: message,
      position: 'bottom',
      visibilityTime: 3000,
      autoHide: true,
    });
  };

  const handleLogin = async () => {
    setIsLoading(true);

    try {
      if (!email || !password) {
        showToast('error', 'Please fill in all fields.');
        setIsLoading(false);
        return;
      }

      let success;
      try {
        success = await login(email, password);
      } catch (loginError) {
        success = false;
      }

      if (success) {
        showToast('success', 'Login successful!');
        navigation.navigate('Main');
      } else {
        showToast('error', 'Invalid email or password.');
      }
    }
    catch (error) {
      showToast('error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }

  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
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
            keyboardVerticalOffset={Platform.OS === "ios" ? -180 : 0}
          >
            < View style={{ flexDirection: "column", alignItems: 'center' }}>
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
            <TouchableOpacity onPress={openModal}
              testID="SignUp-button">
              <Text style={styles.privacyText}>Terms & Privacy Policy </Text>
            </TouchableOpacity>
            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={closeModal}>

              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>

                  <ScrollView
                    style={styles.modalContent}
                    contentContainerStyle={{ paddingBottom: 30, paddingTop: 20 }}
                  >
                    <TermsOfService />
                    <View style={styles.hr} />
                    <PrivacyPolicy />
                  </ScrollView>

                  <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>

                </View>
              </View>
            </Modal>


          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
      <Toast />
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
  privacyText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Nunito-medium',
    textShadowColor: 'rgba(67, 43, 15, 0.75)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    paddingTop: 60,
  },
  signupLink: {
    fontSize: 17,
    color: "rgb(248, 208, 114)",
    fontFamily: 'Nunito-Bold',
    textShadowColor: 'rgba(52, 33, 12, 0.8)',
    textShadowOffset: { width: 1, height: 3 },
    textShadowRadius: 5,
  },
  logo: {
    width: width * 0.8,
    height: width * 0.32,
    resizeMode: 'contain',
  },
  errorMessage: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'Nunito-Bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '77%',
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#D7C5B7",
    width: 200,
    alignSelf: "center",
  },
  closeButtonText: {
    color: '#574E47',
    fontFamily: 'Nunito-Bold',
  },
  modalContent: {

    maxHeight: '100%',

  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: "rgb(117, 102, 82)",
    marginVertical: 10,
    padding: 10,
    marginTop: 23,
    marginBottom: 36
  },
});

export default LoginScreen;
