# 🍄 Sienimetsä Frontend

Frontend project for the "Software Project 2" course application. This frontend repository manages the user interface for "Sienimetsä" application.
Sienimetsä is a mushroom detection mobile application featuring a user profile, AI-powered camera for identifying mushrooms, a chatroom for community interaction, a comprehensive mushroom library, and a personal log for tracking your own mushroom discoveries.

## 🍃 Table of Contents

- [About the Project](#about-the-project)
- [Built With](#built-with)
- [Roadmap](#roadmap)
- [Installation and getting started](#installation-and-getting-started)
- [Testing](#testing)
- [License](#license)

---

## 🏕 About the Project

Sienimetsä is a mobile application developed as part of the Software Project 2 course, designed to enhance the mushroom foraging experience through the power of modern mobile technologies and AI.

The sienimetsa-frontend project is the frontend component of the app, built using React Native and Expo. It provides an intuitive user interface that allows users to:

🍄 Identify mushrooms using an AI-powered camera.
🗝 Manage personal user profiles.
💬 Engage with other mushroom enthusiasts in a built-in community chatroom.
📚 Browse a comprehensive library of mushroom species.
🪺 Track and log personal mushroom discoveries over time.

Whether you're a seasoned mycologist or a curious explorer, Sienimetsä offers a smart, social, and educational experience for discovering and understanding mushrooms in nature.

Made By:  
🌱 Sophia Dunkley  - [SophiaDun](https://github.com/SophiaDun)  
🪲 Heta Heikkilä - [hetaheikkila](https://github.com/hetaheikkila)  
🍀 Mio Kantola - [Maajoo](https://github.com/Maajoo)  
🌿 Ossi Saurio - [Iso-S](https://github.com/Iso-S)  
  
### Pictures
<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/04a25fa2-fbc3-441e-918f-b375197da94b" width="200"/></td>
    <td><img src="https://github.com/user-attachments/assets/25f596c9-0191-47ee-91c3-2bb1eb85962c" width="200"/></td>
    <td><img src="https://github.com/user-attachments/assets/322ced03-f7fa-4d50-993b-7b8aaa616626" width="200"/></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/8a0e4110-2973-40cf-acd0-ede9b1f28173" width="200"/></td>
    <td><img src="https://github.com/user-attachments/assets/3eb4733e-bfe4-4f63-a655-87442907c394" width="200"/></td>
    <td><img src="https://github.com/user-attachments/assets/a65f8c4e-e900-46ae-b1b7-5e4365ab22b2" width="200"/></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/65388c91-ff49-4201-8bbc-d347aed22264" width="200"/></td>
    <td><img src="https://github.com/user-attachments/assets/f07e3485-26e6-4df8-8ca4-9dc1cf73938c" width="200"/></td>
    <td><img src="https://github.com/user-attachments/assets/ae3cf053-b4bc-4066-a76d-c477e32cc051" width="200"/></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/08f6ba12-8cd8-4fa3-a4f0-68b5669943f5" width="200"/></td>
    <td><img src="https://github.com/user-attachments/assets/95191944-84f0-47dd-8367-6a3878e2f5b2" width="200"/></td>
    <td><img src="https://github.com/user-attachments/assets/bad1759c-a9e2-4235-858d-8621463a73f0" width="200"/></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/8fd0ca91-d584-4566-af39-90e27ddced28" width="200"/></td>
  </tr>
</table>


---

## 🛠️ Built With

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [STOMP over WebSocket](https://stomp-js.github.io/)
- [Axios](https://axios-http.com/)
- [JWT Decode](https://github.com/auth0/jwt-decode)
- [AsyncStorage](https://github.com/react-native-async-storage/async-storage)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [Expo Camera](https://docs.expo.dev/versions/latest/sdk/camera/)
- [Jest](https://jestjs.io/) + [Testing Library](https://callstack.github.io/react-native-testing-library/)

---

## 🌐 Roadmap

- [x] Initial release
- [x] Add user authentication
- [x] Implement python mushroom identification service
- [x] Multiuser chat
- [ ] Publish app on Heroku / Firebase / Render.com
- [ ] Develope AI (python) forward

---

## 🌱 Installation and getting started

To get a local copy up and running, follow these steps:

1. Clone the project:
   ```bash
   git clone https://github.com/Sienimetsa/sienimetsa-frontend.git
   cd sienimetsa-frontend
   ```
2. Download [Expo Go](https://expo.dev/go) mobile app on your device. You can download it from App Store (iPhone users) or Google Play Store (Android users).
   
3. Download all the depencies using this command:
   ```bash
   npm install
   ```
   
4. Start the app
```bash
  npx expo start
  ```
5. Open your camera (on your mobile device) and read the Qr-code from your bash.

## 🧩 Testing
This project uses jest with jest-expo and @testing-library/react-native.

To run tests:
```bash
npm test
  ```
   
### License
![cc](https://github.com/user-attachments/assets/aefc75b4-4252-451f-a134-b540c90a5fd5)

