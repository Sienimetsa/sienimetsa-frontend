import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';  
import { makeProtectedRequest } from '../Service/AuthService';  

const HomeScreen = () => {
  const [data, setData] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      const responseData = await makeProtectedRequest();
      setData(responseData);
    };

    fetchData();
  }, []);

  return (
    <View>
      <Text>Protected Data:</Text>
      {data ? <Text>{JSON.stringify(data)}</Text> : <Text>Home</Text>}
      <Button
        title="Go to Settings"
        onPress={() => navigation.navigate('Settings')}
      />
    </View>
  );
};

export default HomeScreen;
