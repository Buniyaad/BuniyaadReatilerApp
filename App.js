import * as React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Container, NativeBaseProvider} from 'native-base';
import Login from './components/login';


export default function App() {
  

  return (
    
  
      <Login /> 
   
      
    
  );
};

const styles = StyleSheet.create({
  containerStyle:{
    backgroundColor:'white',
}
});


