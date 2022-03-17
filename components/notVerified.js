import * as React from 'react';
import {StyleSheet, Image, Linking} from 'react-native';
import {
  Container,
  Content,
  Text,
  Button,
} from 'native-base';
import Icon from 'react-native-ionicons';

export default class NotVerified extends React.Component{

  open_WhatsApp(){
    //alert("hghj")
    Linking.openURL("https://wa.me/+923213543115?text=Mainey%20abhi%20Buniyaad%20App%20per%20signup%20kia%20hai!%20Mera%20account%20activate%20kar%20dain")
  }
  
    render(){return(
      <Container style={styles.containerStyle}>
        <Content>
              
         <Text style={styles.txt} >Unfortunatley You cannot access this page until admin verifies your account</Text>
         
         <Button
              style={styles.btnStyle}
              onPress={() => this.open_WhatsApp()

                 /*this.props.navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
           })*/}>
              <Text
                style={{color: '#FFC000', fontWeight: 'bold', fontSize: 20}}>
                 message Buniyaad
              </Text>
              <Icon color="#25D366" name="logo-whatsapp" />
            </Button>

            
        
        </Content>
      </Container>
        
    )}
    
}

const styles = StyleSheet.create({
  containerStyle: {
    justifyContent: 'center',
    backgroundColor: '#FFC000',
    flex:1,
  },
  logoStyle: {
    alignSelf: 'center',
    marginTop: 100,
  },
  txt: {
    marginTop: 200,
    alignSelf: 'center',
    textAlign:'center',
    fontWeight: 'bold',
    color: '#303030',
  },
  phoneInputStyle: {
    marginTop: 20,
    alignSelf: 'center',
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: 'white',
    borderRadius: 15,
  },
  inputlabelStyle: {
    borderRightWidth: 1,
    borderRightColor: '#FFC000',
  },
  btnStyle: {
    marginTop: 30,
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    borderRadius: 15,
  },
});