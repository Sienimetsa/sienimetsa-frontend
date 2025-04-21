import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';

const TermsOfService = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Terms of Service</Text>
      <Text style={styles.date}>Updated: 20.04.2025</Text>

      <Text style={styles.sectionTitle}>1. General Terms</Text>
      <Text style={styles.paragraph}>
        These Terms of Service govern your use of Sienimetsa. By using this service, you agree
        to these terms. If you do not agree to these terms, you may not use our service.
      </Text>

      <Text style={styles.sectionTitle}>2. Account and Security</Text>
      <Text style={styles.paragraph}>
        You are responsible for maintaining the security of your account, including your
        username and password. You should not share your login credentials with third parties.
        You are responsible for all activities that occur under your account.
      </Text>

      <Text style={styles.sectionTitle}>3. License to Use the Service</Text>
      <Text style={styles.paragraph}>
        We grant you a non-exclusive, non-transferable license to use the service for personal
        purposes in accordance with these terms.
      </Text>

      <Text style={styles.sectionTitle}>4. Content and Intellectual Property</Text>
      <Text style={styles.paragraph}>
        All content within the service, including text, images, software, and other materials, is
        owned by Sienimetsa or licensed to it, and you may not use such content without
        permission.
      </Text>

      <Text style={styles.sectionTitle}>5. Disclaimers</Text>
      <Text style={styles.paragraph}>
        The service is provided "as is" and we do not guarantee that it will be uninterrupted or
        error-free. We are not responsible for any damages that may arise from the use of the
        service.
      </Text>

      <Text style={styles.sectionTitle}>6. Privacy and Data Collection</Text>
      <Text style={styles.paragraph}>
        Your privacy is important to us. We handle your data in accordance with our privacy
        policy. By using this service, you agree to the collection and processing of your data as
        described in this policy.
      </Text>

      <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
      <Text style={styles.paragraph}>
        We reserve the right to modify these terms at any time. If we make significant changes,
        we will notify you and the updated version of the Terms of Service will become effective.
      </Text>

      <Text style={styles.sectionTitle}>8. Governing Law and Dispute Resolution</Text>
      <Text style={styles.paragraph}>
        These terms are governed by the laws of Finland.
      </Text>

      <Text style={styles.sectionTitle}>Contact Information</Text>
      <Text style={styles.paragraph}>
        Sienimetsa{"\n"}
        Sienimetsa/github.com{"\n"}
        @SienimetsaTheApp.com{"\n"}
        +358 000 000 000
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
  },
  date: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#777',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
  },
  paragraph: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
});

export default TermsOfService;
