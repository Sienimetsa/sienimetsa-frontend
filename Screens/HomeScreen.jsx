import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { makeProtectedRequest } from '../Service/AuthService';  

const HomeScreen = () => {
  const [data, setData] = useState(null);

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
      {data ? <Text>{JSON.stringify(data)}</Text> : <Text>Loading...</Text>}
    </View>
  );
};

export default HomeScreen;
