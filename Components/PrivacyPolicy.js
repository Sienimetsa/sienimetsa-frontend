import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';

const PrivacyPolicy = () => {
  return (
    <ScrollView>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.date}>Updated: 20.04.2025</Text>

      <Text style={styles.sectionTitle}>1. Introduction</Text>
      <Text style={styles.paragraph}>
        At Sienimetsa, we respect your privacy and are committed to protecting your personal
        data. This Privacy Policy explains how we collect, use, and protect your information when you
        use Sienimetsa Application.
      </Text>

      <Text style={styles.sectionTitle}>2. Information We Collect</Text>
      <Text style={styles.paragraph}>
        We collect the following information when you use our service:
      </Text>
      <Text style={styles.paragraph}>
        <Text style={styles.bold}>Personal Information:</Text> such as your name, email address, and phone number.
      </Text>

      <Text style={styles.sectionTitle}>3. How We Use Your Data</Text>
      <Text style={styles.paragraph}>
        We use the collected information for the following purposes:
      </Text>
      <Text style={styles.paragraph}>
        - To provide and maintain our service
      </Text>
      <Text style={styles.paragraph}>
        - To provide customer support and assistance
      </Text>
      <Text style={styles.paragraph}>
        - To comply with legal obligations and ensure security
      </Text>

      <Text style={styles.sectionTitle}>4. Sharing of Information</Text>
      <Text style={styles.paragraph}>
        We do not sell or share your personal data with third parties except when required by
        law or to provide services through third-party providers.
      </Text>

      <Text style={styles.sectionTitle}>5. Data Security</Text>
      <Text style={styles.paragraph}>
        We are committed to securing your personal information and use appropriate security
        measures to prevent unauthorized access, disclosure, or alteration of your data.
      </Text>

      <Text style={styles.sectionTitle}>6. Your Rights</Text>
      <Text style={styles.paragraph}>
        You have the right to:
      </Text>
      <Text style={styles.paragraph}>
        - Request access to your personal data
      </Text>
      <Text style={styles.paragraph}>
        - Correct or delete inaccurate or outdated information
      </Text>
      <Text style={styles.paragraph}>
        - Withdraw your consent to data processing
      </Text>

      <Text style={styles.sectionTitle}>7. Data Retention</Text>
      <Text style={styles.paragraph}>
        We retain your personal data for as long as it is necessary to provide our services and to
        comply with legal requirements.
      </Text>

      <Text style={styles.sectionTitle}>8. Changes to the Privacy Policy</Text>
      <Text style={styles.paragraph}>
        We may update this Privacy Policy from time to time. All changes will be posted on this
        page, and they will become effective immediately.
      </Text>

      <Text style={styles.sectionTitle}>9. Contact Information</Text>
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
  bold: {
    fontWeight: 'bold',
  },
});

export default PrivacyPolicy;
