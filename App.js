import React,{useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Container, NativeBaseProvider} from 'native-base';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from './components/login';
import Home from './components/home';
import Categories from './components/categories';
import Cart from './components/cart';
import Account from './components/account';
import Otp from './components/otp';
import Setpin from './components/setpin';
import Pin from './components/pin';
import NotVerified from './components/notVerified';
import Search from './components/search';
import CategoriesSearch from './components/categoriesSearch';
import analytics from '@react-native-firebase/analytics';
import { Mixpanel } from 'mixpanel-react-native';
import messaging from '@react-native-firebase/messaging';


const mixpanel= new Mixpanel("bc7f90d8dffd6db873b39aad77b29bf0");
mixpanel.init();
const Stack = createNativeStackNavigator();


  

export default function App() {

  const sendFcmToken = async () => {
    try {
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      console.log("token is:",token)
      fetch(
        `https://api.buniyaad.pk/notification/register`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            token: `bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyMWI2M2MyMjhlYWZiZmRiZTM0YjVjNiIsImNvbnRhY3RObyI6IjAzMjQ0Nzk5ODI0IiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTY0NjI5MTk2MiwiZXhwIjoxNjQ2ODk2NzYyfQ.Lfi4j_CqWfIGk6-DpG6CVJ5Rwno3NlSTmiUU1zpB7pA`,
          },
          body: JSON.stringify({
            token:token
          }),
        },
      )
        .then(response => response.json())
        .then(data => console.log(data));
    } catch (err) {
      //Do nothing
      console.log(err.response.data);
      return;
    }
  }


   useEffect(() => {
    sendFcmToken();
  }, []);


  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Categories"
          component={Categories}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Cart"
          component={Cart}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Account"
          component={Account}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Otp"
          component={Otp}
          options={{
            title: 'Mobile number darj karein',
            headerStyle: {
              backgroundColor: '#FFC000',
            },
          }}
        />
        <Stack.Screen
          name="Setpin"
          component={Setpin}
          options={{
            title: 'Pin set karein',
            headerStyle: {
              backgroundColor: '#FFC000',
            },
          }}
        />
        <Stack.Screen
          name="Pin"
          component={Pin}
          options={{
            title: 'Pin darj karein',
            headerStyle: {
              backgroundColor: '#FFC000',
            },
          }}
        />
        <Stack.Screen
          name="Search"
          component={Search}
          options={{
            title: 'Search',
            headerStyle: {
              backgroundColor: '#FFC000',
            },
          }}
        />
        <Stack.Screen
          name="CategoriesSearch"
          component={CategoriesSearch}
          options={{
            title: 'Products by category',
            headerStyle: {
              backgroundColor: '#FFC000',
            },
          }}
        />
        <Stack.Screen
          name="NotVerified"
          component={NotVerified}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: 'white',
  },
});
