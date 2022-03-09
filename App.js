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
import OtpLogin from './components/otpLogin'
import analytics from '@react-native-firebase/analytics';
import { Mixpanel } from 'mixpanel-react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Adjust, AdjustEvent, AdjustConfig } from 'react-native-adjust';

const mixpanel= new Mixpanel("bc7f90d8dffd6db873b39aad77b29bf0");
mixpanel.init();
const Stack = createNativeStackNavigator();


export default function App() {
  const adjust= async ()=>{
    const adjustConfig = new AdjustConfig("4py4iuyxgem8", AdjustConfig.EnvironmentSandbox);
    Adjust.create(adjustConfig);
  }

  useEffect(() => {
    adjust();

    return () => {
      // Anything in here is fired on component unmount.
      Adjust.componentWillUnmount();
  }   
  }, []);

 /* const storeToken= async ()=>{
    const token = await messaging().getToken();
   
    try {
      const jsonValue = JSON.stringify(token)
      await AsyncStorage.setItem('token', jsonValue)
      console.log("FCM token: ",jsonValue)
    } catch (e) {
      // saving error
    }
  }





   useEffect(() => {
    storeToken();
   
  }, []);
*/

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
          name="OtpLogin"
          component={OtpLogin}
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
