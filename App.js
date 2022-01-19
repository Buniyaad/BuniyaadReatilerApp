import * as React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Container, NativeBaseProvider} from 'native-base';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './components/login';
import Home from './components/home';
import Categories from './components/categories';
import Cart from './components/cart';
import Account from './components/account';

const Stack = createNativeStackNavigator();

export default function App() {
  

  return (
    <NavigationContainer>
      <Stack.Navigator>

      <Stack.Screen name="Login" component={Login}  options={{headerShown: false}} />
      <Stack.Screen name="Home" component={Home}  options={{headerShown: false}} /> 
      <Stack.Screen name="Categories" component={Categories}  options={{headerShown: false}} /> 
      <Stack.Screen name="Cart" component={Cart}  options={{headerShown: false}} /> 
      <Stack.Screen name="Account" component={Account}  options={{headerShown: false}} />      

      </Stack.Navigator>
    </NavigationContainer>
    
  

   
      
    
  );
};

const styles = StyleSheet.create({
  containerStyle:{
    backgroundColor:'white',
}
});
