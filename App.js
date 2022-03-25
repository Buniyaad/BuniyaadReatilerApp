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
import Onboarding from './components/onboarding'
import Notifications from './components/notifications'

import analytics from '@react-native-firebase/analytics';
import { Mixpanel } from 'mixpanel-react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';


const mixpanel= new Mixpanel("bc7f90d8dffd6db873b39aad77b29bf0");
mixpanel.init();
const Stack = createNativeStackNavigator();


export default function App() {


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
 */  

   useEffect(() => {

    messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage.notification,
        );
        //setInitialRoute(remoteMessage.data.type); // e.g. "Settings"
      }
      //setLoading(false);
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
     // navigation.navigate(remoteMessage.data.type);
    });

    messaging().onMessage(async remoteMessage => {
       alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
  })
   
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
        <Stack.Screen
          name="Onboarding"
          component={Onboarding}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Notifications"
          component={Notifications}
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
